import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import RoomSelect from './pages/RoomSelect';
import Play from './pages/Play';
import Learn from './pages/Learn';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-cloud font-sans text-gray-800 overflow-hidden selection:bg-honey selection:text-white">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/rooms" element={<RoomSelect />} />
          <Route path="/play" element={<Play />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;