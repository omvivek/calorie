import React, { useState, useEffect } from "react";

const CheckCalories = () => {
  const [input, setInput] = useState(""); 
  const [responseMessage, setResponseMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [foodNames, setFoodNames] = useState([]);

  // Fetch food names from the database
  useEffect(() => {
    const fetchFoodNames = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/get-all-foods/");
        if (!response.ok) {
          throw new Error("Failed to fetch food names");
        }
        const data = await response.json();
        setFoodNames(data.map((item) => item.name.toLowerCase()));
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchFoodNames();
  }, []);

  const findClosestName = (inputName) => {
    for (const dbName of foodNames) {
      if (inputName.includes(dbName)) {
        return dbName;
      }
    }
    return null;
  };

  const parseInput = (inputString) => {
    const items = inputString.split(",").map((item) => {
      const parts = item.trim().split(" ");

      if (parts.length < 2) {
        throw new Error(`Invalid format for '${item}'. Use format like '1 cup of rice'.`);
      }

      const quantity = parseFloat(parts[0]);
      if (isNaN(quantity)) {
        throw new Error(`Invalid quantity for '${item}'. Quantity must be a number.`);
      }

      const nameParts = parts.slice(1).join(" ").toLowerCase();
      const matchedName = findClosestName(nameParts);

      if (!matchedName) {
        throw new Error(`No match found for '${nameParts}' in the database.`);
      }

      return { quantity, name: matchedName };
    });

    return items;
  };

  const handleCheckCalories = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponseMessage(null);

    try {
      const items = parseInput(input);
      const results = [];
      let totalCalories = 0;

      for (const item of items) {
        const response = await fetch(
          `http://127.0.0.1:8000/get-calories/?name=${item.name}&quantity=${item.quantity}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error fetching data for '${item.name}'`);
        }

        const data = await response.json();
        results.push({
          name: data.name,
          quantity: data.requested_quantity,
          unit: data.unit,
          calories: data.calories,
        });
        totalCalories += data.calories;
      }

      const resultMessage = results
        .map(
          (res) =>
            `${res.quantity} ${res.unit} of ${res.name}: ${res.calories.toFixed(2)} cal`
        )
        .join("\n");

      setResponseMessage(`Total Calories: ${totalCalories.toFixed(2)} cal\n\n${resultMessage}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Check Calories</h2>
      <form onSubmit={handleCheckCalories}>
        <div>
          <label htmlFor="input">Food Input:</label>
          <input
            type="text"
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 1 cup of rice, 2 roti"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Check Calories"}
        </button>
      </form>

      {responseMessage && (
        <div>
          <h3>Results:</h3>
          <pre>{responseMessage}</pre>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CheckCalories;
