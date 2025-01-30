import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the authentication token
    localStorage.removeItem('authToken');
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <nav>
      <ul>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/history">History</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li>
          <button onClick={handleLogout} style={{ cursor: 'pointer', color: 'red', border: 'none', background: 'none' }}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
