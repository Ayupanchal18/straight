import React, { useState } from 'react';
import { FavoritesProvider } from './context/FavoritesContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LiveScoresList } from './components/features/live/LiveScoresList';
import { ScheduleList } from './components/features/schedule/ScheduleList';
import { PlayerSearch } from './components/features/players/PlayerSearch';
import { PlayerCompare } from './components/features/compare/PlayerCompare';
import { FavoritesView } from './components/features/favorites/FavoritesView';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [selectedPlayerQuery, setSelectedPlayerQuery] = useState('');
  const [comparePlayer1, setComparePlayer1] = useState('Virat Kohli');
  const [comparePlayer2, setComparePlayer2] = useState('Rohit Sharma');

  const handleSelectPlayerFromWatchlist = (playerName) => {
    setSelectedPlayerQuery(playerName);
    setActiveTab('players');
  };

  const handleCompareFromProfile = (playerName) => {
    setComparePlayer1(playerName);
    setActiveTab('compare');
  };

  return (
    <FavoritesProvider>
      <div className="min-h-screen flex flex-col bg-[#070a12] stadium-bg selection:bg-emerald-500 selection:text-slate-950">
        {/* Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onGlobalSearch={(q) => {
            setSelectedPlayerQuery(q);
            setActiveTab('players');
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
          {activeTab === 'live' && (
            <LiveScoresList 
              onSelectTab={setActiveTab}
              onSearchPlayer={handleSelectPlayerFromWatchlist}
            />
          )}

          {activeTab === 'schedule' && <ScheduleList />}

          {activeTab === 'players' && (
            <PlayerSearch
              initialQuery={selectedPlayerQuery}
              onCompare={handleCompareFromProfile}
            />
          )}

          {activeTab === 'compare' && (
            <PlayerCompare
              defaultPlayer1={comparePlayer1}
              defaultPlayer2={comparePlayer2}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView
              onSelectPlayer={handleSelectPlayerFromWatchlist}
              onSelectTab={setActiveTab}
            />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </FavoritesProvider>
  );
}
