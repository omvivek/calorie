import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Search from './components/Dashboard/Search';
import History from './components/Dashboard/History';
import Profile from './components/Dashboard/Profile';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import LandingPage from './components/Auth/LandingPage';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<Search />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </Router>
);

export default App;
