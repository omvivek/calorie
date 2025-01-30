import React, { useState } from 'react';
import Navbar from '../Navbar';
import axios from 'axios';

const Search = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // console.log(token)
      const { data } = await axios.post('http://127.0.0.1:8000/get-calories', { food_items: query },
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Add token here
          },
        }
      );
      setResponse(data);
    } catch (error) {
      alert(error.response.data.detail);
    }
  };

  return (
    <div>
        <Navbar />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter food items"
      />
      <button onClick={handleSearch}>Search</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
};

export default Search;
