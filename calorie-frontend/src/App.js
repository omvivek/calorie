import React from "react";
import "./App.css";
import CalorieForm from "./components/calorieForm";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Calorie Estimation App</h1>
        <CalorieForm />
      </header>
    </div>
  );
}

export default App;
