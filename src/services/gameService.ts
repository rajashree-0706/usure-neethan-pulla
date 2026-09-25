import { 
  db, 
  ensureAuth, 
  isFirebaseConfigured,
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  runTransaction, 
  query, 
  where, 
  serverTimestamp
} from './firebase';
import type { 
  GameSession, 
  PublicQuestionData, 
  TeamPublicData, 
  TeamPrivateState,
  MemberData, 
  QuestionItem,
  GuessResult 
} from '../types/game';

export const generateGamePin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const parseBulkQuestions = (text: string): QuestionItem[] => {
  const lines = text.split('\n');
  const items: QuestionItem[] = [];
  lines.forEach((line, idx) => {
    const parts = line.split('|');
    if (parts.length >= 2) {
      const word = parts[0].trim().toUpperCase().replace(/[^A-Z]/g, '');
      const clue = parts[1].trim();
      if (word && clue) {
        items.push({
          id: `q_item_${Date.now()}_${idx}`,
          word,
          clue
        });
      }
    }
  });
  return items;
};

export class GameService {
  static async createGame(questions: QuestionItem[], roundDuration: number = 60, maxMembersPerTeam: number = 10): Promise<{ gameId: string; gamePin: string }> {
    console.log("[CREATE] Starting game creation");
    
    if (!isFirebaseConfigured() || !db) {
      console.error("[CREATE] Failed: Firebase configuration is missing in .env file.");
      throw new Error("Firebase is not configured. Please create a .env file with your VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID. See README.md for setup instructions.");
    }

    console.log("[CREATE] Firebase initialized");

    const user = await ensureAuth();
    console.log("[CREATE] Host authenticated:", user.uid);

    const gamePin = generateGamePin();
    const gameRef = doc(collection(db, 'games'));
    const gameId = gameRef.id;

    const gameData: GameSession = {
      id: gameId,
      gamePin,
      hostId: user.uid,
      title: "USURE NEEDHAN PULLA - HANGMAN CHALLENGE",
      status: 'lobby',
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      roundDuration,
      maxMembersPerTeam,
      createdAt: serverTimestamp(),
    };

    // Timeout protection for Firestore writes
    const firestoreWrite = Promise.all([
      setDoc(gameRef, gameData),
      setDoc(doc(db, `games/${gameId}/questionsBank`, 'list'), { items: questions })
    ]);

    const timeoutGuard = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Firestore database write timed out (10s limit). Please check your internet connection and Firestore Security Rules."));
      }, 10000);
    });

    await Promise.race([firestoreWrite, timeoutGuard]);

    console.log("[CREATE] Game document created:", gameId);
    console.log("[CREATE] Teams created (ready for join)");
    console.log("[CREATE] Questions created:", questions.length, "items");
    console.log("[CREATE] Host session created");

    return { gameId, gamePin };
  }

  static async findGameByPin(gamePin: string): Promise<GameSession | null> {
    if (!db) return null;
    const q = query(collection(db, 'games'), where('gamePin', '==', gamePin.trim()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0].data() as GameSession;
    return { ...docData, id: snapshot.docs[0].id };
  }

  static async joinGame(gamePin: string, rawTeamName: string, playerName: string): Promise<{ gameId: string; teamId: string; memberId: string }> {
    if (!db) {
      throw new Error("Firebase is not configured. Please add your credentials to .env file.");
    }
    const user = await ensureAuth();
    const game = await this.findGameByPin(gamePin);
    if (!game) {
      throw new Error("Game PIN not found. Please verify the 6-digit PIN.");
    }
    if (game.status === 'game_over') {
      throw new Error("This game session has ended.");
    }

    const teamName = rawTeamName.trim();
    const teamCode = teamName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const gameId = game.id;

    const teamRef = doc(db, `games/${gameId}/teams`, teamCode);
    const memberRef = doc(db, `games/${gameId}/teams/${teamCode}/members`, user.uid);

    await runTransaction(db, async (transaction) => {
      const teamDoc = await transaction.get(teamRef);
      const membersSnap = await getDocs(collection(db, `games/${gameId}/teams/${teamCode}/members`));

      if (teamDoc.exists()) {
        const membersCount = membersSnap.size;
        const isExistingMember = membersSnap.docs.some(d => d.id === user.uid);
        if (!isExistingMember && membersCount >= (game.maxMembersPerTeam || 10)) {
          throw new Error(`Team "${teamName}" is full (Max ${game.maxMembersPerTeam} members).`);
        }
      } else {
        const newTeamData: TeamPublicData = {
          id: teamCode,
          teamName: teamName,
          teamCode: teamCode,
          totalScore: 0,
          currentQuestionScore: 0,
          status: 'idle',
          solved: false,
          joinedAt: new Date().toISOString()
        };
        transaction.set(teamRef, newTeamData);
      }

      const memberData: MemberData = {
        id: user.uid,
        name: playerName.trim(),
        online: true,
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      };
      transaction.set(memberRef, memberData);
    });

    return { gameId, teamId: teamCode, memberId: user.uid };
  }

  static subscribeToGame(gameId: string, callback: (game: GameSession | null) => void) {
    if (!db) {
      callback(null);
      return () => {};
    }
    const gameRef = doc(db, 'games', gameId);
    return onSnapshot(gameRef, (snap) => {
      if (snap.exists()) {
        callback({ ...snap.data(), id: snap.id } as GameSession);
      } else {
        callback(null);
      }
    });
  }

  static subscribeToTeams(gameId: string, callback: (teams: TeamPublicData[]) => void) {
    if (!db) {
      callback([]);
      return () => {};
    }
    const teamsRef = collection(db, `games/${gameId}/teams`);
    return onSnapshot(teamsRef, (snap) => {
      const teams = snap.docs.map(d => ({ ...d.data(), id: d.id } as TeamPublicData));
      callback(teams);
    });
  }

  static subscribeToTeamMembers(gameId: string, teamId: string, callback: (members: MemberData[]) => void) {
    if (!db) {
      callback([]);
      return () => {};
    }
    const membersRef = collection(db, `games/${gameId}/teams/${teamId}/members`);
    return onSnapshot(membersRef, (snap) => {
      const members = snap.docs.map(d => ({ ...d.data(), id: d.id } as MemberData));
      callback(members);
    });
  }

  static subscribeToQuestion(gameId: string, questionIndex: number, callback: (q: PublicQuestionData | null) => void) {
    if (!db) {
      callback(null);
      return () => {};
    }
    const questionRef = doc(db, `games/${gameId}/questions`, `q_${questionIndex}`);
    return onSnapshot(questionRef, (snap) => {
      if (snap.exists()) {
        callback({ ...snap.data(), id: snap.id } as PublicQuestionData);
      } else {
        callback(null);
      }
    });
  }

  static subscribeToPrivateTeamState(gameId: string, teamId: string, questionIndex: number, callback: (state: TeamPrivateState | null) => void) {
    if (!db) {
      callback(null);
      return () => {};
    }
    const stateRef = doc(db, `games/${gameId}/teams/${teamId}/questionStates`, `q_${questionIndex}`);
    return onSnapshot(stateRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as TeamPrivateState);
      } else {
        callback(null);
      }
    });
  }

  static async startNextQuestion(gameId: string): Promise<void> {
    if (!db) return;
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) return;
    const game = gameSnap.data() as GameSession;

    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex > game.totalQuestions) {
      await updateDoc(gameRef, { status: 'game_over' });
      return;
    }

    const qBankSnap = await getDoc(doc(db, `games/${gameId}/questionsBank`, 'list'));
    if (!qBankSnap.exists()) return;
    const questions: QuestionItem[] = qBankSnap.data().items || [];
    const questionItem = questions[nextIndex - 1];
    if (!questionItem) return;

    const targetWord = questionItem.word.toUpperCase().replace(/[^A-Z]/g, '');

    const questionRef = doc(db, `games/${gameId}/questions`, `q_${nextIndex}`);
    const questionData: PublicQuestionData = {
      id: `q_${nextIndex}`,
      questionIndex: nextIndex,
      clue: questionItem.clue,
      wordLength: targetWord.length,
      status: 'active',
      startTime: serverTimestamp(),
      endTime: null
    };

    const secretRef = doc(db, `games/${gameId}/hostSecrets`, `q_${nextIndex}`);
    await setDoc(secretRef, {
      questionId: `q_${nextIndex}`,
      word: targetWord,
      clue: questionItem.clue
    });

    await setDoc(questionRef, questionData);

    const teamsSnap = await getDocs(collection(db, `games/${gameId}/teams`));
    const initialPattern = Array(targetWord.length).fill('_');

    const updatePromises = teamsSnap.docs.map(tDoc => {
      const teamId = tDoc.id;
      const stateRef = doc(db, `games/${gameId}/teams/${teamId}/questionStates`, `q_${nextIndex}`);
      const teamRef = doc(db, `games/${gameId}/teams/${teamId}`);

      const stateData: TeamPrivateState = {
        questionId: `q_${nextIndex}`,
        guessedLetters: [],
        correctLetters: [],
        wrongLetters: [],
        revealedPattern: initialPattern,
        wrongGuessesCount: 0,
        solved: false,
        solveTime: undefined,
        score: 0
      };

      const publicUpdate = {
        status: 'playing',
        solved: false,
        solveTime: null,
        currentQuestionScore: 0
      };

      return Promise.all([
        setDoc(stateRef, stateData),
        updateDoc(teamRef, publicUpdate)
      ]);
    });

    await Promise.all(updatePromises);

    await updateDoc(gameRef, {
      status: 'active',
      currentQuestionIndex: nextIndex,
      startedAt: serverTimestamp()
    });
  }

  static async submitGuess(
    gameId: string, 
    teamId: string, 
    letter: string, 
    questionIndex: number,
    roundDurationSeconds: number
  ): Promise<GuessResult> {
    if (!db) throw new Error("Firebase not configured.");
    const cleanLetter = letter.toUpperCase();
    const teamRef = doc(db, `games/${gameId}/teams`, teamId);
    const stateRef = doc(db, `games/${gameId}/teams/${teamId}/questionStates`, `q_${questionIndex}`);
    const secretRef = doc(db, `games/${gameId}/hostSecrets`, `q_${questionIndex}`);
    const questionRef = doc(db, `games/${gameId}/questions`, `q_${questionIndex}`);

    const result = await runTransaction(db, async (transaction) => {
      const stateSnap = await transaction.get(stateRef);
      const secretSnap = await transaction.get(secretRef);
      const questionSnap = await transaction.get(questionRef);
      const teamSnap = await transaction.get(teamRef);

      if (!stateSnap.exists() || !secretSnap.exists() || !questionSnap.exists() || !teamSnap.exists()) {
        throw new Error("Game state invalid.");
      }

      const privateState = stateSnap.data() as TeamPrivateState;
      const secret = secretSnap.data() as { word: string };
      const question = questionSnap.data() as PublicQuestionData;
      const team = teamSnap.data() as TeamPublicData;

      if (privateState.solved || question.status === 'ended') {
        return {
          isCorrect: false,
          letter: cleanLetter,
          revealedPattern: privateState.revealedPattern || [],
          solved: privateState.solved,
          wrongGuessesCount: privateState.wrongGuessesCount
        };
      }

      const guessedLetters = privateState.guessedLetters || [];
      if (guessedLetters.includes(cleanLetter)) {
        return {
          isCorrect: secret.word.includes(cleanLetter),
          letter: cleanLetter,
          revealedPattern: privateState.revealedPattern || [],
          solved: privateState.solved,
          wrongGuessesCount: privateState.wrongGuessesCount
        };
      }

      const word = secret.word;
      const isCorrect = word.includes(cleanLetter);
      const newGuessed = [...guessedLetters, cleanLetter];
      const newCorrect = isCorrect ? [...(privateState.correctLetters || []), cleanLetter] : (privateState.correctLetters || []);
      const newWrong = !isCorrect ? [...(privateState.wrongLetters || []), cleanLetter] : (privateState.wrongLetters || []);
      let newWrongCount = privateState.wrongGuessesCount || 0;
      let newPattern = [...(privateState.revealedPattern || Array(word.length).fill('_'))];

      if (isCorrect) {
        for (let i = 0; i < word.length; i++) {
          if (word[i] === cleanLetter) {
            newPattern[i] = cleanLetter;
          }
        }
      } else {
        newWrongCount += 1;
      }

      const isSolved = !newPattern.includes('_');
      let solveTime = privateState.solveTime;
      let questionScore = privateState.score || 0;
      let newTotalScore = team.totalScore || 0;

      if (isSolved && !privateState.solved) {
        const startTime = question.startTime ? (question.startTime.toMillis ? question.startTime.toMillis() : Date.now()) : Date.now();
        const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        solveTime = elapsedSeconds;

        questionScore = Math.max(50, Math.round(100 - (elapsedSeconds / roundDurationSeconds) * 50));
        newTotalScore += questionScore;
      }

      const updatedPrivateState: Partial<TeamPrivateState> = {
        guessedLetters: newGuessed,
        correctLetters: newCorrect,
        wrongLetters: newWrong,
        revealedPattern: newPattern,
        wrongGuessesCount: newWrongCount,
        solved: isSolved,
        ...(isSolved ? { solveTime, score: questionScore } : {})
      };

      const updatedPublicTeam: Partial<TeamPublicData> = {
        status: isSolved ? 'solved' : 'playing',
        solved: isSolved,
        ...(isSolved ? { solveTime, currentQuestionScore: questionScore, totalScore: newTotalScore } : {})
      };

      transaction.update(stateRef, updatedPrivateState);
      transaction.update(teamRef, updatedPublicTeam);

      return {
        isCorrect,
        letter: cleanLetter,
        revealedPattern: newPattern,
        solved: isSolved,
        wrongGuessesCount: newWrongCount
      };
    });

    return result;
  }

  static async endQuestion(gameId: string, questionIndex: number): Promise<void> {
    if (!db) return;
    const questionRef = doc(db, `games/${gameId}/questions`, `q_${questionIndex}`);
    const secretRef = doc(db, `games/${gameId}/hostSecrets`, `q_${questionIndex}`);
    const gameRef = doc(db, 'games', gameId);

    const secretSnap = await getDoc(secretRef);
    const targetWord = secretSnap.exists() ? secretSnap.data().word : 'UNKNOWN';

    await updateDoc(questionRef, {
      status: 'ended',
      endTime: serverTimestamp(),
      revealedWord: targetWord
    });

    await updateDoc(gameRef, {
      status: 'question_result'
    });
  }

  static async updateQuestionsBank(gameId: string, questions: QuestionItem[]): Promise<void> {
    if (!db) return;
    const questionsRef = doc(db, `games/${gameId}/questionsBank`, 'list');
    await setDoc(questionsRef, { items: questions });
    await updateDoc(doc(db, 'games', gameId), { totalQuestions: questions.length });
  }

  static async getQuestionsBank(gameId: string): Promise<QuestionItem[]> {
    if (!db) return [];
    const questionsRef = doc(db, `games/${gameId}/questionsBank`, 'list');
    const snap = await getDoc(questionsRef);
    if (snap.exists()) {
      return snap.data().items || [];
    }
    return [];
  }

  static async removeTeam(gameId: string, teamId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, `games/${gameId}/teams`, teamId));
  }

  static async removeMember(gameId: string, teamId: string, memberId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, `games/${gameId}/teams/${teamId}/members`, memberId));
  }

  static async getHostSecretWord(gameId: string, questionIndex: number): Promise<string | null> {
    if (!db) return null;
    const secretSnap = await getDoc(doc(db, `games/${gameId}/hostSecrets`, `q_${questionIndex}`));
    if (secretSnap.exists()) {
      return secretSnap.data().word;
    }
    return null;
  }
}
