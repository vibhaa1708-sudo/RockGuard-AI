import { useState } from "react";
import "./App.css";

function App() {
  const [prediction, setPrediction] = useState(null);

  const [formData, setFormData] = useState({
    rainfall: 35,
    temperature: 28,
    humidity: 75,
    soil_moisture: 65,
    vibration: 0.8,
    deformation: 7,
    slope_angle: 42,
    slope_height: 120,
    blast_activity: 1,
    crack_growth: 5,
    previous_events: 2,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handlePredict = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      setPrediction(data);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to RockGuard AI backend.");
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">⛰</div>
          <div>
            <h1>RockGuard AI</h1>
            <p>Rockfall Prediction & Alert System</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
      </header>


      {/* MAIN */}
      <main className="dashboard">

        {/* HERO */}
        <section className="hero-section">
          <div>
            <p className="eyebrow">AI-POWERED MINE SAFETY</p>

            <h2>
              Predict rockfall risk
              <br />
              <span>before it happens.</span>
            </h2>

            <p className="hero-text">
              RockGuard AI analyzes environmental, geological and
              operational conditions to detect potential rockfall hazards.
            </p>
          </div>

          <div className="hero-badge">
            <span>LIVE</span>
            <strong>Monitoring</strong>
            <small>AI risk engine active</small>
          </div>
        </section>


        {/* SENSOR INPUT */}
        <section className="panel">

          <div className="panel-heading">
            <div>
              <p className="section-label">01 / SENSOR INPUT</p>
              <h3>Current Site Conditions</h3>
            </div>

            <span className="input-count">
              {Object.keys(formData).length} PARAMETERS
            </span>
          </div>


          <div className="sensor-grid">

            {Object.entries(formData).map(([key, value]) => (
              <div className="input-group" key={key}>

                <label htmlFor={key}>
                  {key.replaceAll("_", " ")}
                </label>

                <input
                  id={key}
                  name={key}
                  type="number"
                  step="any"
                  value={value}
                  onChange={handleChange}
                />

              </div>
            ))}

          </div>


          <button className="predict-button" onClick={handlePredict}>
            RUN ROCKFALL ANALYSIS
            <span>→</span>
          </button>

        </section>


        {/* RESULTS */}
        {prediction && (
          <section className="results">

            <div className="panel-heading">
              <div>
                <p className="section-label">02 / AI ANALYSIS</p>
                <h3>Prediction Result</h3>
              </div>
            </div>


            <div className="result-grid">

              {/* PROBABILITY */}
              <div className="result-card probability-card">
                <p>ROCKFALL PROBABILITY</p>

                <div className="probability">
                  {prediction.rockfall_probability}%
                </div>

                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${prediction.rockfall_probability}%`,
                    }}
                  ></div>
                </div>
              </div>


              {/* RISK */}
              <div className="result-card">
                <p>RISK LEVEL</p>

                <div
                  className={`risk ${prediction.risk_level.toLowerCase()}`}
                >
                  {prediction.risk_level}
                </div>

                <span className="prediction-message">
                  {prediction.message}
                </span>
              </div>


              {/* PREDICTION */}
              <div className="result-card">
                <p>ROCKFALL PREDICTION</p>

                <div className="prediction-status">
                  {prediction.rockfall_prediction ? "⚠ DETECTED" : "✓ SAFE"}
                </div>
              </div>

            </div>


            {/* SHAP */}
            <div className="risk-factors">

              <div>
                <p className="section-label">EXPLAINABILITY</p>
                <h3>Top Risk Factors</h3>
              </div>

              <div className="factor-list">

                {prediction.top_risk_factors.map((factor, index) => (
                  <div className="factor" key={factor}>

                    <span className="factor-number">
                      0{index + 1}
                    </span>

                    <span>
                      {factor.replaceAll("_", " ")}
                    </span>

                    <span className="factor-arrow">↗</span>

                  </div>
                ))}

              </div>

            </div>

          </section>
        )}


        {/* EMPTY STATE */}
        {!prediction && (
          <section className="empty-state">

            <div className="radar">◉</div>

            <h3>Awaiting Analysis</h3>

            <p>
              Enter or adjust the sensor parameters above and run
              the AI analysis to detect rockfall risk.
            </p>

          </section>
        )}

      </main>


      {/* FOOTER */}
      <footer>
        <span>ROCKGUARD AI</span>
        <span>AI-BASED ROCKFALL PREDICTION SYSTEM</span>
        <span>v1.2.0</span>
      </footer>

    </div>
  );
}

export default App;