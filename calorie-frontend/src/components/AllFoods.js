import React, { useState, useEffect } from "react";

const AllFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/get-all-foods/");
        if (!response.ok) {
          throw new Error("Failed to fetch foods.");
        }
        const data = await response.json();
        setFoods(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  return (
    <div>
      <h2>All Foods</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Food Name</th>
            <th>Calories Per Unit</th>
            <th>Unit</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.id}>
              <td>{food.name}</td>
              <td>{food.calories_per_unit}</td>
              <td>{food.unit}</td>
              <td>{food.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllFoods;
