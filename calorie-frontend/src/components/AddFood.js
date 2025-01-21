import React, { useState } from "react";

const AddFood = () => {
  const [name, setName] = useState("");
  const [caloriesPerUnit, setCaloriesPerUnit] = useState(null);
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [responseMessage, setResponseMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddFood = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponseMessage(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/add-food/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          calories_per_unit: caloriesPerUnit,
          unit,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error adding food item.");
      }

      setResponseMessage("Food item added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add Food</h2>
      <form onSubmit={handleAddFood}>
        <div>
          <label htmlFor="name">Food Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Rice, Roti"
            required
          />
        </div>
        <div>
          <label htmlFor="caloriesPerUnit">Calories Per Unit:</label>
          <input
            type="number"
            id="caloriesPerUnit"
            value={caloriesPerUnit || ""}
            onChange={(e) => setCaloriesPerUnit(Number(e.target.value))}
            placeholder="e.g., 120"
            required
          />
        </div>
        <div>
          <label htmlFor="unit">Unit:</label>
          <input
            type="text"
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g., cup, count"
            required
          />
        </div>
        <div>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="e.g., 1, 2"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Add Food"}
        </button>
      </form>

      {responseMessage && (
        <div>
          <h3>Response:</h3>
          <p>{responseMessage}</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddFood;
