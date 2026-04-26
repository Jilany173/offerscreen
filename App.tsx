
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignageScreen from './src/pages/SignageScreen';
import AdminPanel from './src/pages/AdminPanel';
import Login from './src/pages/Login';
import ProtectedRoute from './src/components/ProtectedRoute';
import PromotionScreen from './src/pages/PromotionScreen';
import ResultScreen from './src/pages/ResultScreen';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignageScreen />} />
        <Route path="/promotions" element={<PromotionScreen />} />
        <Route path="/results" element={<ResultScreen />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
