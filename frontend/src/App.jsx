import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const fields = [
  { name: "rainfall", label: "Rainfall", unit: "mm", icon: "◒" },
  { name: "temperature", label: "Temperature", unit: "°C", icon: "◉" },
  { name: "humidity", label: "Humidity", unit: "%", icon: "≈" },
  { name: "soil_moisture", label: "Soil Moisture", unit: "%", icon: "◌" },
  { name: "vibration", label: "Vibration", unit: "mm/s", icon: "∿" },
  { name: "deformation", label: "Deformation", unit: "mm", icon: "↕" },
  { name: "slope_angle", label: "Slope Angle", unit: "°", icon: "∠" },
  { name: "slope_height", label: "Slope Height", unit: "m", icon: "△" },
  { name: "blast_activity", label: "Blast Activity", unit: "index", icon: "✦" },
  { name: "crack_growth", label: "Crack Growth", unit: "mm/day", icon: "⌁" },
  { name: "previous_events", label: "Previous Events", unit: "count", icon: "◷" },
];

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
        throw new Error("Prediction failed");
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

  const scrollToAnalysis = () => {
    document
      .getElementById("analysis-panel")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="rockguard-app">

      {/* ================= HEADER ================= */}

      <header className="topbar">

        <div className="brand">
          <div className="brand-mark">
            ◈
          </div>

          <div className="brand-text">
            <h1>
              ROCKGUARD <span>AI</span>
            </h1>

            <p>
              OPEN-PIT MINE INTELLIGENCE
            </p>
          </div>
        </div>

        <div className="header-right">

          <div className="system-status">
            <span className="status-dot"></span>
            SYSTEM OPERATIONAL
          </div>

          <div className="api-status">
            API / LIVE
          </div>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="dashboard">


        {/* ================= HERO ================= */}

        <section className="hero-section">

          <div className="hero-grid">

            <div className="hero-copy">

              <div className="eyebrow">
                AI-POWERED ROCKFALL INTELLIGENCE
              </div>

              <h2>
                Predict danger.
                <br />
                <span>Protect people.</span>
              </h2>

              <p className="hero-description">
                RockGuard AI analyzes environmental, geological,
                and mining conditions to identify rockfall risk
                before it becomes a safety threat.
              </p>

              <div className="hero-actions">

                <button
                  className="analysis-button"
                  onClick={scrollToAnalysis}
                >
                  RUN NEW ANALYSIS
                  <span>→</span>
                </button>

                <div className="hero-meta">
                  <span className="meta-dot"></span>
                  MACHINE LEARNING MONITORING
                </div>

              </div>

            </div>


            {/* ================= RISK PANEL ================= */}

            <div className="risk-card">

              <div className="risk-card-top">

                <span>
                  CURRENT SITE RISK
                </span>

                <span className="risk-live">
                  LIVE
                </span>

              </div>

              <div className="risk-display">

                <div className="risk-ring">

                  <div className="risk-ring-inner">

                    {result ? (
                      <>
                        <strong>
                          {result.rockfall_probability}
                        </strong>

                        <span>%</span>
                      </>
                    ) : (
                      <>
                        <strong>--</strong>
                        <span>%</span>
                      </>
                    )}

                  </div>

                </div>

                <div className="risk-info">

                  {result ? (
                    <>
                      <span
                        className={`risk-state ${result.risk_level.toLowerCase()}`}
                      >
                        {result.risk_level} RISK
                      </span>

                      <p>
                        {result.message}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="risk-state waiting">
                        AWAITING ANALYSIS
                      </span>

                      <p>
                        Run a site analysis to calculate
                        current rockfall probability.
                      </p>
                    </>
                  )}

                </div>

              </div>

              <div className="risk-footer">
                <span>MODEL STATUS</span>
                <strong>READY</strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= SENSOR NETWORK ================= */}

        <section className="section">

          <div className="section-heading">

            <div>
              <span className="eyebrow">
                MONITORING NETWORK
              </span>

              <h3>
                Site Sensors
              </h3>
            </div>

            <div className="live-indicator">
              <span></span>
              LIVE INPUT
            </div>

          </div>


          <div className="sensor-grid">

            <SensorCard
              title="RAINFALL"
              value={formData.rainfall || "--"}
              unit="mm"
              icon="◒"
            />

            <SensorCard
              title="VIBRATION"
              value={formData.vibration || "--"}
              unit="mm/s"
              icon="∿"
            />

            <SensorCard
              title="DEFORMATION"
              value={formData.deformation || "--"}
              unit="mm"
              icon="↕"
            />

            <SensorCard
              title="CRACK GROWTH"
              value={formData.crack_growth || "--"}
              unit="mm/day"
              icon="⌁"
            />

          </div>

        </section>


        {/* ================= ANALYSIS ================= */}

        <section
          className="analysis-layout"
          id="analysis-panel"
        >


          {/* ================= INPUT PANEL ================= */}

          <div className="analysis-form panel">

            <div className="panel-header">

              <div>
                <span className="eyebrow">
                  SENSOR PARAMETERS
                </span>

                <h3>
                  Site Analysis
                </h3>
              </div>

              <span className="panel-number">
                01
              </span>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="input-grid">

                {fields.map((field) => (

                  <div
                    className="input-field"
                    key={field.name}
                  >

                    <label>
                      <span className="input-icon">
                        {field.icon}
                      </span>

                      <span>
                        {field.label}
                      </span>

                      <small>
                        {field.unit}
                      </small>
                    </label>

                    <input
                      type="number"
                      step="any"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder="Enter value"
                      required
                    />

                  </div>

                ))}

              </div>


              <button
                className="predict-button"
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-loader"></span>
                    ANALYZING SITE...
                  </>
                ) : (
                  <>
                    ANALYZE ROCKFALL RISK
                    <span>→</span>
                  </>
                )}

              </button>

            </form>

          </div>


          {/* ================= AI EXPLANATION ================= */}

          <div className="panel explanation">

            <div className="panel-header">

              <div>
                <span className="eyebrow">
                  MODEL INTELLIGENCE
                </span>

                <h3>
                  Why is the model concerned?
                </h3>
              </div>

              <span className="panel-number">
                02
              </span>

            </div>


            {!result && (

              <div className="empty-analysis">

                <div className="ai-symbol">
                  ◈
                </div>

                <h4>
                  Awaiting site analysis
                </h4>

                <p>
                  Submit sensor readings to reveal
                  the factors influencing the AI prediction.
                </p>

              </div>

            )}


            {result && (

              <div className="result-analysis">

                <div className="explanation-message">

                  <span className="explanation-icon">
                    ✦
                  </span>

                  <p>
                    The AI identified these factors as
                    major contributors to the current
                    rockfall prediction.
                  </p>

                </div>


                <div className="factor-list">

                  {result.top_risk_factors.map(
                    (factor, index) => (

                      <div
                        className="factor"
                        key={factor}
                      >

                        <span className="factor-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <strong>
                          {factor.replaceAll("_", " ")}
                        </strong>

                        <span className="impact">
                          HIGH IMPACT
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </div>

        </section>


        {/* ================= ERROR ================= */}

        {error && (

          <div className="error-banner">
            <span>⚠</span>
            {error}
          </div>

        )}

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <span>
          ROCKGUARD AI
        </span>

        <span>
          AI-BASED ROCKFALL PREDICTION & ALERT SYSTEM
        </span>

        <span>
          v1.0
        </span>

      </footer>

    </div>
  );
}


/* ================= SENSOR CARD ================= */

function SensorCard({ title, value, unit, icon }) {

  return (

    <div className="sensor-card">

      <div className="sensor-top">

        <div className="sensor-title">

          <span className="sensor-icon">
            {icon}
          </span>

          <span>
            {title}
          </span>

        </div>

        <span className="sensor-status">
          ●
        </span>

      </div>


      <div className="sensor-value">

        <strong>
          {value}
        </strong>

        <small>
          {unit}
        </small>

      </div>


      <div className="sensor-line">
        <span></span>
      </div>

    </div>

  );
}


export default App;

