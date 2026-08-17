import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [formData, setFormData] = useState({
    rainfall: "",
    temperature: "",
    humidity: "",
    soil_moisture: "",
    vibration: "",
    deformation: "",
    slope_angle: "",
    slope_height: "",
    blast_activity: "",
    crack_growth: "",
    previous_events: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [
              key,
              Number(value),
            ])
          )
        ),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to RockGuard AI backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>RockGuard AI</h1>
          <p>AI-Powered Rockfall Prediction & Alert System</p>
        </div>

        <div className="status">
          <span></span>
          System Online
        </div>
      </header>

      <main className="dashboard">
        <section className="card">
          <h2>Sensor Data</h2>
          <p className="subtitle">
            Enter current mine and environmental conditions.
          </p>

          <form onSubmit={handleSubmit}>
            {Object.keys(formData).map((field) => (
              <div className="input-group" key={field}>
                <label>{field.replaceAll("_", " ")}</label>

                <input
                  type="number"
                  step="any"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Rockfall Risk"}
            </button>
          </form>
        </section>

        <section className="card results">
          <h2>Prediction Result</h2>

          {!result && !error && (
            <div className="empty-state">
              <p>Enter sensor data and analyze the risk.</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <p>AI model is analyzing sensor conditions...</p>
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {result && (
            <div className="result-content">
              <div className="probability">
                <span>Rockfall Probability</span>
                <strong>{result.rockfall_probability}%</strong>
              </div>

              <div className={`risk ${result.risk_level.toLowerCase()}`}>
                {result.risk_level}
              </div>

              <p className="message">
                {result.message}
              </p>

              <div className="factors">
                <h3>Top Risk Factors</h3>

                <ul>
                  {result.top_risk_factors.map((factor) => (
                    <li key={factor}>
                      {factor.replaceAll("_", " ")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

