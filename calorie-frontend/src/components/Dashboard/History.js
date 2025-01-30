import React, { useEffect, useState } from 'react';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('authToken');
      
      try {
        const { data } = await axios.get('http://127.0.0.1:8000/history', {
          headers: {
            Authorization: `Bearer ${token}`,  // Send token as Authorization header
          }
        });
        setHistory(data.search_history);
      } catch (error) {
        console.error("Error fetching history:", error);
        // Handle error, perhaps show an alert to the user
      }
    };
    
    fetchHistory();
  }, []);

  return (
    <div>
      <h2>Search History</h2>
      <ul>
        {history.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.query}</strong>
            <pre>{JSON.stringify(entry.response, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
