# USURE NEEDHAN PULLA – HANGMAN ARENA

> **Production-Ready Real-Time Team-Based Multiplayer Hangman Web Application**

Designed for college gaming events, hackathons, and multi-team competitions. Features a **1 Host + Multiple Teams + Multiple Members Per Team** real-time synchronized architecture with time-based scoring, live leaderboards, and zero page refreshes.

---

## ✨ Features

- **1 Host + Unlimited Teams**: Dedicated Host Panel (`/host`) optimized for laptops, desktops, and projectors.
- **Multiple Devices Per Team**: All members of Team Alpha join from their own phones and play on the same shared team board.
- **Independent Team States**: All teams play the **SAME** hidden word simultaneously, but each team has completely independent guessed letters, wrong counts, and solved progress.
- **Real-Time Firebase Synchronization**: Powered by Firestore `onSnapshot` real-time listeners. Zero manual page refreshes.
- **Anti-Cheat & Masked Words**: Target words are kept secure in host secrets and masked from player clients until round completion.
- **Time-Based Scoring**: Continuous time scoring formula (`max(50, round(100 - (elapsedSeconds / duration * 50)))`) minus configurable wrong guess penalties.
- **Zero-Dependency Web Audio Sound FX**: Retro synth audio feedback (key tap, correct chime, wrong buzz, victory fanfare, timer tick).
- **Responsive Mobile & Projector UI**: Neon cyber dark theme, glowing SVG Hangman drawing, interactive virtual keyboard, and victory confetti.

---

## 🛠️ Prerequisites & Stack

- **Frontend**: React 18 / 19, TypeScript, Vite, Tailwind CSS v4
- **Backend / Realtime**: Firebase Firestore, Anonymous Auth
- **Icons & Effects**: Lucide React, Canvas Confetti, QRCode.react

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd hangman-arena
npm install
```

### 2. Configure Firebase Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy Firestore Security Rules
Copy the contents of `firestore.rules` into your Firebase Console under **Firestore Database -> Rules**, or deploy via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 4. Run Development Server
```bash
npm run dev
```
To access from multiple phones on the same Wi-Fi network, run:
```bash
npm run dev -- --host
```

---

## 📱 How to Test with Multiple Devices

1. **Host Device (Laptop / Projector)**:
   - Open `http://<your_local_ip>:5173/host` (or click **Host Game** on the home page).
   - Click **Generate Game Session**.
   - You will see a 6-digit **GAME PIN** (e.g. `482931`) and a **QR Code**.

2. **Player Devices (Phones / Tablets)**:
   - Phone 1: Scan QR Code or go to `http://<your_local_ip>:5173/join`, enter PIN `482931`, Team Name `Team Alpha`, Player Name `Raji`.
   - Phone 2: Join PIN `482931`, Team Name `Team Alpha`, Player Name `Priya`.
   - Phone 3: Join PIN `482931`, Team Name `Team Bravo`, Player Name `Meena`.
   - Phone 4: Join PIN `482931`, Team Name `Team Bravo`, Player Name `Sanjay`.

3. **Host Starts Game**:
   - Host clicks **START GAME (ROUND 1)**.
   - All 4 phones immediately transition to the active game screen.
   - When Raji (Phone 1) clicks **'A'**, Priya (Phone 2) immediately sees **'A'** disabled and updated on Team Alpha's board.
   - Team Bravo's board (Phones 3 & 4) remains completely unaffected!

---

## 🌐 Deploying to Firebase Hosting

```bash
# Build production bundle
npm run build

# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy to live URL
firebase deploy --only hosting
```

---

## 📂 Project Structure

```
hangman-arena/
├── public/
├── src/
│   ├── components/
│   │   ├── HangmanGraphic.tsx     # Animated SVG neon Hangman
│   │   ├── LeaderboardTable.tsx   # Live rankings table
│   │   ├── LetterKeyboard.tsx     # A-Z virtual keyboard
│   │   ├── Navbar.tsx             # Header with audio toggle
│   │   ├── TimerDisplay.tsx       # Server-timestamp synced timer
│   │   └── WordDisplay.tsx        # Word blanks and letter cards
│   ├── data/
│   │   └── defaultWords.ts        # Word dataset & categories
│   ├── pages/
│   │   ├── CreateGamePage.tsx     # Game settings configuration
│   │   ├── FinalResultsPage.tsx    # Victory podium & ceremony
│   │   ├── HostDashboardPage.tsx  # Projector / Laptop host panel
│   │   ├── LandingPage.tsx        # Home screen
│   │   ├── LeaderboardPage.tsx    # Standalone live leaderboard
│   │   ├── PlayerGamePage.tsx     # Mobile gameplay screen
│   │   ├── PlayerJoinPage.tsx     # Player join form & lobby
│   │   └── RoundResultsPage.tsx   # Round completion summary
│   ├── services/
│   │   ├── firebase.ts            # Firebase initialization & Auth
│   │   ├── gameService.ts         # Firestore transactions & game logic
│   │   └── soundService.ts        # Web Audio API synthesizer
│   ├── types/
│   │   └── game.ts                # TypeScript models & types
│   ├── App.tsx                    # React Router configuration
│   ├── index.css                  # Tailwind CSS & cyber grid styles
│   └── main.tsx                   # React root entry
├── firestore.rules                # Firestore security rules
├── index.html                     # HTML shell
├── package.json
└── vite.config.ts
```

---

## 📜 License
MIT License • Built for **USURE NEEDHAN PULLA – HANGMAN ARENA**.
