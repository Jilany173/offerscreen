
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OfferScreen from './src/pages/OfferScreen';
import AdminPanel from './src/pages/AdminPanel';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OfferScreen />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
};

export default App;
