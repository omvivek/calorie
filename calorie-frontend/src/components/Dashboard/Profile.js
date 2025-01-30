import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("authToken");  // Ensure token is retrieved properly

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        console.error("No token found! Redirect to login.");
        return;
      }
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/profile", {
          headers: { Authorization: `Bearer ${token}` },  // Send token properly
        });
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data?.detail || error.message);
        if (error.response?.status === 401) {
          alert("Session expired! Please log in again.");
          localStorage.removeItem("authToken");  // Clear expired token
          window.location.href = "/login";  // Redirect user to login page
        }
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <div>
      {profile ? (
        <div>
          <h2>{profile.username}</h2>
          <p>Email: {profile.email}</p>
          <p>Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
