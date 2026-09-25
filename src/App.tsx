import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { CreateGamePage } from './pages/CreateGamePage';
import { HostDashboardPage } from './pages/HostDashboardPage';
import { PlayerJoinPage } from './pages/PlayerJoinPage';
import { PlayerGamePage } from './pages/PlayerGamePage';
import { RoundResultsPage } from './pages/RoundResultsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { FinalResultsPage } from './pages/FinalResultsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateGamePage />} />
        <Route path="/host" element={<HostDashboardPage />} />
        <Route path="/join" element={<PlayerJoinPage />} />
        <Route path="/play" element={<PlayerGamePage />} />
        <Route path="/results" element={<RoundResultsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/final" element={<FinalResultsPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
