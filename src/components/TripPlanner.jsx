import React, { useState } from "react";

const TripPlanner = ({ onGenerate }) => {
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState(10000);
  const [city, setCity] = useState("Delhi");

  const handleGenerate = () => {
    if (days < 1) return alert("Days must be at least 1");
    if (budget < 1000) return alert("Budget too low");

    onGenerate(days, budget, city);
  };

  return (
    <div
      style={{
        marginTop: 15,
        padding: 14,
        background: "rgba(0,0,0,0.85)",
        borderRadius: 12,
        border: "1px solid #333"
      }}
    >
      <h4 style={{ color: "#00ffcc", marginBottom: 12 }}>
        🧭 Plan Your Trip
      </h4>

      {/* City */}
      <label style={labelStyle}>City</label>
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={inputStyle}
      >
        <option value="Delhi">Delhi</option>
        <option value="Jaipur" disabled>Jaipur (coming soon)</option>
        <option value="Agra" disabled>Agra (coming soon)</option>
      </select>

      {/* Days */}
      <label style={labelStyle}>Number of Days</label>
      <input
        type="number"
        min={1}
        max={7}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        style={inputStyle}
      />

      {/* Budget */}
      <label style={labelStyle}>Budget (₹)</label>
      <input
        type="number"
        min={1000}
        step={500}
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        style={inputStyle}
      />

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        style={{
          width: "100%",
          marginTop: 14,
          padding: 12,
          background: "linear-gradient(135deg, #00d2ff, #3a7bd5)",
          color: "#000",
          border: "none",
          borderRadius: 10,
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        ✨ Generate Smart Plan
      </button>

      <p
        style={{
          fontSize: 11,
          color: "#888",
          marginTop: 10,
          textAlign: "center"
        }}
      >
        AI-powered planning • Map-first experience
      </p>
    </div>
  );
};

/* ------------------ STYLES ------------------ */

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "#aaa",
  marginTop: 10,
  marginBottom: 4
};

const inputStyle = {
  width: "100%",
  padding: 8,
  background: "#111",
  color: "white",
  border: "1px solid #444",
  borderRadius: 6,
  outline: "none"
};

export default TripPlanner;
