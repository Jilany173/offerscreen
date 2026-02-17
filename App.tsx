
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OfferScreen from './src/pages/OfferScreen';
import AdminPanel from './src/pages/AdminPanel';
import Login from './src/pages/Login';
import ProtectedRoute from './src/components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OfferScreen />} />
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
