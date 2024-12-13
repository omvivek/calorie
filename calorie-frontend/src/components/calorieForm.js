import React, { useState } from "react";

const CalorieForm = () => {
  const [foodItems, setFoodItems] = useState("");
  const [calories, setCalories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/get-calories/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ food_items: foodItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong");
      }

      const data = await response.json();
      setCalories(data.calories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="foodItems">Enter Food Items:</label>
          <input
            type="text"
            id="foodItems"
            value={foodItems}
            onChange={(e) => setFoodItems(e.target.value)}
            placeholder="e.g., 1 apple, 2 bananas"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Estimating..." : "Get Calories"}
        </button>
      </form>

      {calories && (
        <div>
          <h2>Estimated Calories:</h2>
          <p>{calories}</p>
        </div>
      )}

      {error && (
        <div>
          <h2>Error:</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default CalorieForm;
