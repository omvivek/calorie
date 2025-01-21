import React, { useState } from "react";
import "./App.css";
import CheckCalories from "./components/CheckCalories";
import AddFood from "./components/AddFood";
import AllFoods from "./components/AllFoods";

function App() {
  const [activeTab, setActiveTab] = useState("check");

  return (
    <div className="App">
      <header className="App-header">
        <h1>Calorie Estimation</h1>
        <nav className="nav-bar">
          <button
            className={activeTab === "check" ? "active-tab" : ""}
            onClick={() => setActiveTab("check")}
          >
            Check Calories
          </button>
          <button
            className={activeTab === "add" ? "active-tab" : ""}
            onClick={() => setActiveTab("add")}
          >
            Add Food
          </button>
          <button
            className={activeTab === "all" ? "active-tab" : ""}
            onClick={() => setActiveTab("all")}
          >
            Get All Foods
          </button>
        </nav>

        <main>
          {activeTab === "check" && <CheckCalories />}
          {activeTab === "add" && <AddFood />}
          {activeTab === "all" && <AllFoods />}
        </main>
      </header>
    </div>
  );
}

export default App;
