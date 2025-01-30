import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/login', {
        username: formData.username,
        password: formData.password,
      });
      console.log("Login Response:", response);  // Check full response
  
      const { access_token } = response.data;  // Ensure you're extracting `access_token` correctly
  
      if (access_token) {
        console.log("Access token received:", access_token);  // This will show if the token is correctly extracted
        localStorage.setItem('authToken', access_token);  // Store token in localStorage
        navigate('/search');  // Redirect to another page after successful login
      } else {
        setError("No token received from the server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail && Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map((err) => err.msg).join(', ')
          : error.response?.data?.detail || 'An error occurred during login.';
      setError(errorMessage);
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        name="username"
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">Login</button>
    </form>
  );
  
};

export default Login;
