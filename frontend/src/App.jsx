import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  // =========================================================
  // FORM DATA
  // =========================================================

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

  // =========================================================
  // SECTOR SELECTION
  // =========================================================

  const [selectedSector, setSelectedSector] = useState("A1");

  /*
    IMPORTANT:

    These are NOT fixed geographical GPS boundaries.

    They are logical monitoring sectors used by RockGuard AI
    to identify WHERE the sensor readings belong within the mine.

    The actual mine can be divided differently depending on
    the mine layout and sensor deployment.
  */

  const sectors = [
    {
      id: "A1",
      row: "NORTH",
      position: "WEST",
      description: "North-west monitoring zone",
    },
    {
      id: "A2",
      row: "NORTH",
      position: "CENTER",
      description: "North-central monitoring zone",
    },
    {
      id: "A3",
      row: "NORTH",
      position: "EAST",
      description: "North-east monitoring zone",
    },
    {
      id: "B1",
      row: "CENTRAL",
      position: "WEST",
      description: "Central-west monitoring zone",
    },
    {
      id: "B2",
      row: "CENTRAL",
      position: "CENTER",
      description: "Central monitoring zone",
    },
    {
      id: "B3",
      row: "CENTRAL",
      position: "EAST",
      description: "Central-east monitoring zone",
    },
    {
      id: "C1",
      row: "SOUTH",
      position: "WEST",
      description: "South-west monitoring zone",
    },
    {
      id: "C2",
      row: "SOUTH",
      position: "CENTER",
      description: "South-central monitoring zone",
    },
    {
      id: "C3",
      row: "SOUTH",
      position: "EAST",
      description: "South-east monitoring zone",
    },
  ];

  const currentSector =
    sectors.find((sector) => sector.id === selectedSector) ||
    sectors[0];

  // =========================================================
  // STATE
  // =========================================================

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // =========================================================
  // FETCH PREDICTION HISTORY
  // =========================================================

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`);

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("History error:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================================
  // HANDLE SECTOR CHANGE
  // =========================================================

  const handleSectorChange = (sector) => {
    setSelectedSector(sector);

    /*
      Clear previous result because the user has moved
      to a different monitoring sector.
    */
    setResult(null);
    setError("");
  };

  // =========================================================
  // HANDLE PREDICTION
  // =========================================================

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
        body: JSON.stringify({
          /*
            Sector is selected from the UI.

            User does NOT manually type A1/B2/etc.
          */
          sector: selectedSector,

          ...Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [
              key,
              Number(value),
            ])
          ),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        console.error(
          "Prediction API error:",
          errorData
        );

        throw new Error("Prediction failed");
      }

      const data = await response.json();

      setResult(data);

      await fetchHistory();
    } catch (err) {
      console.error("Prediction error:", err);

      setError(
        "Unable to connect to RockGuard AI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RISK HELPERS
  // =========================================================

  const getRiskClass = () => {
    if (!result?.risk_level) return "waiting";

    return result.risk_level.toLowerCase();
  };

  const getRiskProgress = () => {
    if (!result) return 0;

    const probability =
      Number(result.rockfall_probability) || 0;

    return Math.min(Math.max(probability, 0), 100);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="rockguard-app">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
              OPEN-PIT MINE INTELLIGENCE SYSTEM
            </p>

          </div>

        </div>

        <div className="header-right">

          <div className="system-status">
            <span className="status-dot"></span>
            SYSTEM OPERATIONAL
          </div>

          <div className="api-status">
            API ONLINE
          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="hero-section">

          <div className="hero-grid">

            <div className="hero-copy">

              <span className="eyebrow">
                AI-POWERED ROCKFALL MONITORING
              </span>

              <h2>
                Predict danger
                <br />
                <span>before it happens.</span>
              </h2>

              <p className="hero-description">
                Real-time environmental intelligence and
                machine-learning based rockfall risk
                assessment for open-pit mining operations.
              </p>

              <div className="hero-actions">

                <button
                  className="analysis-button"
                  onClick={() =>
                    document
                      .getElementById("analysis-panel")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  RUN NEW ANALYSIS

                  <span>
                    →
                  </span>

                </button>

                <span className="hero-meta">
                  <span className="meta-dot"></span>
                  XGBOOST + SHAP
                </span>

              </div>

            </div>

            {/* =================================================
                RISK CARD
            ================================================= */}

            <div className="risk-card">

              <div className="risk-card-top">

                <span>
                  CURRENT ROCKFALL RISK
                </span>

                <span className="risk-live">
                  ● LIVE
                </span>

              </div>

              <div className="risk-display">

                {result ? (

                  <>

                    <div
                      className={`risk-ring ${getRiskClass()}`}
                      style={{
                        "--risk-progress": `${getRiskProgress()}%`,
                      }}
                    >

                      <div className="risk-ring-inner">

                        <strong>
                          {result.rockfall_probability}
                        </strong>

                        <span>
                          %
                        </span>

                      </div>

                    </div>

                    <div className="risk-info">

                      <span
                        className={`risk-state ${getRiskClass()}`}
                      >
                        {result.risk_level} RISK
                      </span>

                      <p>
                        {result.message}
                      </p>

                    </div>

                  </>

                ) : (

                  <>

                    <div className="risk-ring waiting">

                      <div className="risk-ring-inner">

                        <strong>
                          --.-
                        </strong>

                        <span>
                          %
                        </span>

                      </div>

                    </div>

                    <div className="risk-info">

                      <span className="risk-state waiting">
                        AWAITING ANALYSIS
                      </span>

                      <p>
                        Run an analysis to calculate
                        current site risk.
                      </p>

                    </div>

                  </>

                )}

              </div>

              {/* =================================================
                  DYNAMIC RISK ALERT
              ================================================= */}

              {result && (

                <div
                  className={`risk-alert ${getRiskClass()}`}
                >

                  <div className="risk-alert-icon">

                    {result.risk_level === "HIGH"
                      ? "⚠"
                      : result.risk_level === "MEDIUM"
                      ? "!"
                      : "✓"}

                  </div>

                  <div className="risk-alert-content">

                    <strong>

                      {result.risk_level === "HIGH"
                        ? "IMMEDIATE ATTENTION"
                        : result.risk_level === "MEDIUM"
                        ? "INCREASED MONITORING"
                        : "SITE CONDITIONS STABLE"}

                    </strong>

                    <span>

                      {result.risk_level === "HIGH"
                        ? "Restrict access and inspect high-risk slope zones."
                        : result.risk_level === "MEDIUM"
                        ? "Continue monitoring deformation, cracks and vibration."
                        : "Continue routine monitoring and standard safety protocols."}

                    </span>

                  </div>

                </div>

              )}

              <div className="risk-footer">

                <span>
                  MODEL STATUS
                </span>

                <strong>
                  {result
                    ? "ANALYSIS COMPLETE"
                    : "READY"}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            SENSOR OVERVIEW
        =================================================== */}

        <section className="section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                LIVE MONITORING
              </span>

              <h3>
                Sensor Network
              </h3>

            </div>

            <span className="live-indicator">
              <span></span>
              LIVE DATA
            </span>

          </div>

          <div className="sensor-grid">

            <SensorCard
              title="RAINFALL"
              value={formData.rainfall || "--"}
              unit="mm"
            />

            <SensorCard
              title="VIBRATION"
              value={formData.vibration || "--"}
              unit="mm/s"
            />

            <SensorCard
              title="DEFORMATION"
              value={formData.deformation || "--"}
              unit="mm"
            />

            <SensorCard
              title="CRACK GROWTH"
              value={formData.crack_growth || "--"}
              unit="mm/day"
            />

          </div>

        </section>

        {/* ===================================================
            ANALYSIS
        =================================================== */}

        <section
          className="analysis-layout"
          id="analysis-panel"
        >

          {/* =================================================
              INPUT FORM
          ================================================= */}

          <div className="analysis-form panel">

            <div className="panel-header">

              <div>

                <span className="eyebrow">
                  INPUT PARAMETERS
                </span>

                <h3>
                  Run Analysis
                </h3>

              </div>

              <span className="panel-number">
                01
              </span>

            </div>

            <form onSubmit={handleSubmit}>

              {/* =================================================
                  SECTOR SELECTION
              ================================================= */}

              <div className="sector-selection">

                <div className="sector-selection-header">

                  <div>

                    <span className="eyebrow">
                      MINE ZONE LOCALIZATION
                    </span>

                    <h4>
                      Select Monitoring Sector
                    </h4>

                    <p>
                      Select the area of the mine where
                      these sensor readings were recorded.
                      The sector is assigned by the
                      monitoring layout — you do not need
                      to enter it manually.
                    </p>

                  </div>

                  <div className="selected-sector">

                    SELECTED

                    <strong>
                      {selectedSector}
                    </strong>

                  </div>

                </div>


                {/* =================================================
                    SECTOR MAP
                ================================================= */}

                <div className="sector-map-wrapper">

                  <div className="sector-map-label north">
                    NORTH / HIGH WALL SIDE
                  </div>

                  <div className="sector-grid">

                    {sectors.map((sector) => (

                      <button
                        type="button"
                        key={sector.id}
                        className={`sector-button ${
                          selectedSector === sector.id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleSectorChange(
                            sector.id
                          )
                        }
                        title={sector.description}
                      >

                        <span className="sector-code">
                          {sector.id}
                        </span>

                        <span className="sector-label">
                          {sector.row}
                        </span>

                        <span className="sector-position">
                          {sector.position}
                        </span>

                      </button>

                    ))}

                  </div>

                  <div className="sector-map-label south">
                    SOUTH / PIT FLOOR SIDE
                  </div>

                </div>


                {/* =================================================
                    SELECTED SECTOR INFORMATION
                ================================================= */}

                <div className="sector-info">

                  <div className="sector-info-marker">
                    ◈
                  </div>

                  <div>

                    <span>
                      MONITORING LOCATION
                    </span>

                    <strong>
                      SECTOR {selectedSector}
                    </strong>

                    <p>
                      {currentSector.description}.
                      Sensor readings entered below will
                      be associated with this sector.
                    </p>

                  </div>

                </div>


                {/* =================================================
                    LEGEND
                ================================================= */}

                <div className="sector-legend">

                  <span>
                    <i className="legend-dot low"></i>
                    LOW RISK
                  </span>

                  <span>
                    <i className="legend-dot medium"></i>
                    MEDIUM RISK
                  </span>

                  <span>
                    <i className="legend-dot high"></i>
                    HIGH RISK
                  </span>

                  <span className="sector-legend-note">
                    Sector layout represents logical
                    monitoring zones
                  </span>

                </div>

              </div>


              {/* =================================================
                  SENSOR INPUTS
              ================================================= */}

              <div className="input-grid">

                {Object.keys(formData).map((field) => (

                  <div
                    className="input-field"
                    key={field}
                  >

                    <label>

                      <span className="input-icon">
                        ◈
                      </span>

                      {field.replaceAll("_", " ")}

                      <small>
                        SENSOR
                      </small>

                    </label>

                    <input
                      type="number"
                      step="any"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder="Enter value"
                      required
                    />

                  </div>

                ))}

              </div>


              {/* =================================================
                  PREDICT BUTTON
              ================================================= */}

              <button
                className="predict-button"
                type="submit"
                disabled={loading}
              >

                <span>

                  {loading
                    ? "ANALYZING SITE..."
                    : `ANALYZE ${selectedSector} RISK`}

                </span>

                {loading ? (

                  <span className="button-loader"></span>

                ) : (

                  <span>
                    →
                  </span>

                )}

              </button>

            </form>

          </div>


          {/* =================================================
              AI EXPLANATION
          ================================================= */}

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
                  Awaiting sensor analysis
                </h4>

                <p>
                  Complete a sensor analysis to see
                  the AI-generated risk explanation.
                </p>

              </div>

            )}

            {result && (

              <>

                {/* =================================================
                    SELECTED SECTOR RESULT
                ================================================= */}

                <div className="explanation-message">

                  <div className="explanation-icon">
                    ◈
                  </div>

                  <p>

                    Analysis completed for{" "}

                    <strong>
                      {result.sector || selectedSector}
                    </strong>

                    . The model identified the following
                    factors as major contributors to the
                    current prediction.

                  </p>

                </div>


                {/* =================================================
                    FACTORS
                ================================================= */}

                <div className="factor-list">

                  {result.top_risk_factors?.map(
                    (factor, index) => (

                      <div
                        className="factor"
                        key={factor}
                      >

                        <span className="factor-number">
                          0{index + 1}
                        </span>

                        <strong>
                          {factor.replaceAll(
                            "_",
                            " "
                          )}
                        </strong>

                        <i className="impact">
                          HIGH IMPACT
                        </i>

                      </div>

                    )
                  )}

                </div>


                {/* =================================================
                    SAFETY ALERT
                ================================================= */}

                <div
                  className={`safety-alert ${getRiskClass()}`}
                >

                  <div className="alert-icon">

                    {result.risk_level === "HIGH"
                      ? "⚠"
                      : result.risk_level === "MEDIUM"
                      ? "!"
                      : "✓"}

                  </div>

                  <div className="alert-content">

                    <strong>

                      {result.risk_level === "HIGH"
                        ? "IMMEDIATE ATTENTION REQUIRED"
                        : result.risk_level === "MEDIUM"
                        ? "INCREASED MONITORING RECOMMENDED"
                        : "SITE CONDITIONS APPEAR STABLE"}

                    </strong>

                    <p>

                      {result.risk_level === "HIGH"
                        ? "Restrict access to high-risk zones and inspect slope conditions immediately."
                        : result.risk_level === "MEDIUM"
                        ? "Continue continuous monitoring and inspect deformation, cracks and vibration levels."
                        : "Continue routine monitoring and maintain normal safety protocols."}

                    </p>

                  </div>

                </div>

              </>

            )}

          </div>

        </section>


        {/* ===================================================
            DASHBOARD STATISTICS
        =================================================== */}

        <section className="stats-grid">

          <div className="stat-card">

            <span>
              TOTAL ANALYSES
            </span>

            <strong>
              {history.length}
            </strong>

            <small>
              RECORDED PREDICTIONS
            </small>

          </div>


          <div className="stat-card">

            <span>
              HIGH RISK EVENTS
            </span>

            <strong>

              {
                history.filter(
                  (item) =>
                    item.risk_level === "HIGH"
                ).length
              }

            </strong>

            <small>
              REQUIRE ATTENTION
            </small>

          </div>


          <div className="stat-card">

            <span>
              MEDIUM RISK EVENTS
            </span>

            <strong>

              {
                history.filter(
                  (item) =>
                    item.risk_level === "MEDIUM"
                ).length
              }

            </strong>

            <small>
              MONITOR CLOSELY
            </small>

          </div>


          <div className="stat-card">

            <span>
              AVERAGE RISK
            </span>

            <strong>

              {history.length > 0
                ? (
                    history.reduce(
                      (sum, item) =>
                        sum +
                        Number(
                          item.rockfall_probability || 0
                        ),
                      0
                    ) / history.length
                  ).toFixed(1)
                : "0.0"}

              %

            </strong>

            <small>
              LAST {history.length} ANALYSES
            </small>

          </div>

        </section>


        {/* ===================================================
            RISK TREND
        =================================================== */}

        <section className="section trend-section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                RISK INTELLIGENCE
              </span>

              <h3>
                Recent Risk Trend
              </h3>

            </div>

            <span className="live-indicator">
              LAST {history.length} ANALYSES
            </span>

          </div>

          {history.length === 0 ? (

            <div className="empty-analysis">

              <div className="ai-symbol">
                ◈
              </div>

              <p>
                Run predictions to generate
                the risk trend.
              </p>

            </div>

          ) : (

            <div className="trend-chart">

              {history
                .slice()
                .reverse()
                .map((item, index) => {

                  const probability =
                    Number(
                      item.rockfall_probability
                    ) || 0;

                  return (

                    <div
                      className="trend-column"
                      key={item.id || index}
                    >

                      <div className="trend-value">
                        {probability}%
                      </div>

                      <div className="trend-bar-wrapper">

                        <div
                          className={`trend-bar ${
                            item.risk_level?.toLowerCase()
                          }`}
                          style={{
                            height: `${Math.max(
                              probability,
                              4
                            )}%`,
                          }}
                        />

                      </div>

                      <div className="trend-label">

                        {item.sector || "—"}

                      </div>

                    </div>

                  );

                })}

            </div>

          )}

        </section>


        {/* ===================================================
            SITE STATUS
        =================================================== */}

        <section className="section site-status-section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                OPERATIONAL MONITORING
              </span>

              <h3>
                Site Status
              </h3>

            </div>

            <span className="live-indicator">
              ● SYSTEM LIVE
            </span>

          </div>

          <div className="site-status-grid">

            <div className="status-panel">

              <div className="status-panel-top">

                <span>
                  SYSTEM STATUS
                </span>

                <i className="status-dot"></i>

              </div>

              <strong>
                OPERATIONAL
              </strong>

              <p>
                RockGuard AI prediction engine is online
                and ready for analysis.
              </p>

            </div>


            <div className="status-panel">

              <div className="status-panel-top">

                <span>
                  AI MODEL
                </span>

                <i className="status-dot"></i>

              </div>

              <strong>
                XGBOOST
              </strong>

              <p>
                Machine-learning model with SHAP
                explainability enabled.
              </p>

            </div>


            <div className="status-panel">

              <div className="status-panel-top">

                <span>
                  DATABASE
                </span>

                <i className="status-dot"></i>

              </div>

              <strong>
                SUPABASE
              </strong>

              <p>
                Prediction records are being stored
                for historical analysis.
              </p>

            </div>


            <div className="status-panel">

              <div className="status-panel-top">

                <span>
                  SENSOR NETWORK
                </span>

                <i className="status-dot"></i>

              </div>

              <strong>
                ACTIVE
              </strong>

              <p>
                Environmental parameters are ready
                for risk assessment.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            PREDICTION HISTORY
        =================================================== */}

        <section className="section history-section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                RECENT ANALYSES
              </span>

              <h3>
                Prediction History
              </h3>

            </div>

            <span className="live-indicator">
              {history.length} RECORDS
            </span>

          </div>

          {history.length === 0 ? (

            <div className="empty-analysis">

              <div className="ai-symbol">
                ◈
              </div>

              <p>
                No prediction history available yet.
              </p>

            </div>

          ) : (

            <div className="history-list">

              {history.map((item, index) => (

                <div
                  className="history-card"
                  key={item.id || index}
                >

                  <div className="history-main">

                    <div className="history-index">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div>

                      <span className="history-label">

                        SECTOR{" "}
                        {item.sector || "—"}

                      </span>

                      <strong className="history-risk">
                        {item.risk_level}
                      </strong>

                    </div>

                  </div>


                  <div className="history-probability">

                    <span>
                      ROCKFALL PROBABILITY
                    </span>

                    <strong>
                      {item.rockfall_probability}%
                    </strong>

                  </div>


                  <div className="history-prediction">

                    <span>
                      PREDICTION
                    </span>

                    <strong>
                      {item.rockfall_prediction
                        ? "ROCKFALL DETECTED"
                        : "NO ROCKFALL"}
                    </strong>

                  </div>


                  <div className="history-factors">

                    <span>
                      TOP RISK FACTORS
                    </span>

                    <strong>

                      {Array.isArray(
                        item.top_risk_factors
                      )
                        ? item.top_risk_factors
                            .slice(0, 3)
                            .map((factor) =>
                              factor.replaceAll(
                                "_",
                                " "
                              )
                            )
                            .join(" • ")
                        : "N/A"}

                    </strong>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="error-banner">
            ⚠ {error}
          </div>

        )}

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <span>
          ROCKGUARD AI
        </span>

        <span>
          AI-BASED ROCKFALL PREDICTION SYSTEM
        </span>

      </footer>

    </div>
  );
}


// ============================================================
// SENSOR CARD
// ============================================================

function SensorCard({
  title,
  value,
  unit,
}) {
  return (

    <div className="sensor-card">

      <div className="sensor-top">

        <span className="sensor-title">

          <span className="sensor-icon">
            ◈
          </span>

          {title}

        </span>

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