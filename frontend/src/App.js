import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Submit from './pages/Submit';
import History from './pages/History';
import Appeals from './pages/Appeals';
import AdminAppeals from './pages/AdminAppeals';
import AdminPolicies from './pages/AdminPolicies';
import AdminAnalytics from './pages/AdminAnalytics';
const HomeDashboard = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />;
};
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
<Route path="/dashboard" element={<PrivateRoute><HomeDashboard /></PrivateRoute>} />          <Route path="/submit" element={<PrivateRoute><Submit /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/appeals" element={<PrivateRoute><Appeals /></PrivateRoute>} />
          <Route path="/admin/appeals" element={<PrivateRoute adminOnly><AdminAppeals /></PrivateRoute>} />
          <Route path="/admin/policies" element={<PrivateRoute adminOnly><AdminPolicies /></PrivateRoute>} />
          <Route path="/admin/analytics" element={<PrivateRoute adminOnly><AdminAnalytics /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;