import { useEffect, useState } from "react";

import {
  getSites,
  getSiteReadings,
  fetchSiteWeather,
  getSiteBiodiversity,
} from "../api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function EnvironmentalMonitoring() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [readings, setReadings] = useState([]);
  const [biodiversity, setBiodiversity] = useState(null);

  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [loadingBiodiversity, setLoadingBiodiversity] = useState(false);

  const [fetchingWeather, setFetchingWeather] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================================
  // LOAD MONITORING SITES
  // =========================================

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    try {
      setLoadingSites(true);
      setError("");

      const data = await getSites();

      setSites(data || []);

      if (data && data.length > 0) {
        setSelectedSite(String(data[0].id));
      }
    } catch (err) {
      setError(
        err.message || "Unable to load monitoring sites."
      );
    } finally {
      setLoadingSites(false);
    }
  }

  // =========================================
  // LOAD DATA WHEN SITE CHANGES
  // =========================================

  useEffect(() => {
    if (selectedSite) {
      loadReadings(selectedSite);
      loadBiodiversity(selectedSite);
    }
  }, [selectedSite]);

  // =========================================
  // LOAD ENVIRONMENTAL READINGS
  // =========================================

  async function loadReadings(siteId) {
    try {
      setLoadingReadings(true);
      setError("");

      const data = await getSiteReadings(siteId);

      setReadings(data || []);
    } catch (err) {
      setError(
        err.message || "Unable to load environmental readings."
      );
    } finally {
      setLoadingReadings(false);
    }
  }

  // =========================================
  // LOAD BIODIVERSITY DATA
  // =========================================

  async function loadBiodiversity(siteId) {
    try {
      setLoadingBiodiversity(true);

      const data = await getSiteBiodiversity(siteId);

      setBiodiversity(data || null);
    } catch (err) {
      setBiodiversity(null);

      setError(
        err.message || "Unable to load biodiversity data."
      );
    } finally {
      setLoadingBiodiversity(false);
    }
  }

  // =========================================
  // FETCH LATEST WEATHER
  // =========================================

  async function handleFetchWeather() {
    if (!selectedSite) {
      setError("Please select a monitoring site.");
      return;
    }

    try {
      setFetchingWeather(true);
      setError("");
      setMessage("");

      await fetchSiteWeather(selectedSite);

      setMessage(
        "Latest NASA POWER weather data fetched successfully."
      );

      await loadReadings(selectedSite);
    } catch (err) {
      setError(
        err.message || "Unable to fetch environmental data."
      );
    } finally {
      setFetchingWeather(false);
    }
  }

  // =========================================
  // SELECTED SITE
  // =========================================

  const selectedSiteData = sites.find(
    (site) => String(site.id) === String(selectedSite)
  );

  // =========================================
  // LATEST ENVIRONMENTAL READING
  // =========================================

  const latestReading =
    readings.length > 0
      ? readings[readings.length - 1]
      : null;

  // =========================================
  // CHART DATA
  // =========================================

  const chartData = readings
    .slice()
    .sort(
      (a, b) =>
        new Date(a.recorded_at) -
        new Date(b.recorded_at)
    )
    .map((reading) => ({
      date: new Date(
        reading.recorded_at
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),

      temperature:
        reading.temperature !== null &&
        reading.temperature !== undefined
          ? Number(reading.temperature)
          : null,

      rainfall:
        reading.rainfall !== null &&
        reading.rainfall !== undefined
          ? Number(reading.rainfall)
          : null,
    }));

  // =========================================
  // BIODIVERSITY SUMMARY
  // =========================================

  const kingdomCounts =
    biodiversity?.kingdom_counts || {};

  const plants =
    kingdomCounts.Plantae || 0;

  const animals =
    kingdomCounts.Animalia || 0;

  // =========================================
  // FORMAT HELPERS
  // =========================================

  function formatValue(value, unit = "") {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    return `${value}${unit}`;
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  function getSpeciesCategory(species) {
    if (species.kingdom === "Plantae") {
      return "Plant";
    }

    if (species.class_name === "Aves") {
      return "Bird";
    }

    if (species.class_name === "Insecta") {
      return "Insect";
    }

    if (species.class_name === "Amphibia") {
      return "Amphibian";
    }

    if (species.class_name === "Mammalia") {
      return "Mammal";
    }

    if (species.class_name === "Reptilia") {
      return "Reptile";
    }

    return species.kingdom || "Other";
  }

  // =========================================
  // UI
  // =========================================

  return (
    <section className="environment-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="page-header">
        <div>

          <span className="welcome-label">
            ENVIRONMENTAL MONITORING
          </span>

          <h2>Environmental Analytics</h2>

          <p>
            Monitor environmental conditions and
            biodiversity around your monitoring sites.
          </p>

        </div>
      </div>

      {/* =====================================
          MESSAGES
      ====================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* =====================================
          SITE SELECTION
      ====================================== */}

      <div className="environment-controls">

        <div className="environment-site-card">

          <label htmlFor="monitoring-site">
            Select Monitoring Site
          </label>

          {loadingSites ? (
            <p>Loading monitoring sites...</p>
          ) : sites.length === 0 ? (
            <p>No monitoring sites found.</p>
          ) : (
            <select
              id="monitoring-site"
              value={selectedSite}
              onChange={(event) =>
                setSelectedSite(event.target.value)
              }
            >
              {sites.map((site) => (
                <option
                  key={site.id}
                  value={site.id}
                >
                  {site.name}
                </option>
              ))}
            </select>
          )}

          {selectedSiteData && (
            <div className="selected-site-info">

              <strong>
                {selectedSiteData.name}
              </strong>

              <span>
                📍 {selectedSiteData.latitude},{" "}
                {selectedSiteData.longitude}
              </span>

              {selectedSiteData.area_hectares !==
                null &&
                selectedSiteData.area_hectares !==
                  undefined && (
                  <span>
                    🌱{" "}
                    {selectedSiteData.area_hectares}{" "}
                    hectares
                  </span>
                )}

            </div>
          )}

          <button
            type="button"
            className="add-project-button"
            onClick={handleFetchWeather}
            disabled={
              !selectedSite || fetchingWeather
            }
          >
            {fetchingWeather
              ? "Fetching..."
              : "🌤 Fetch Latest Data"}
          </button>

        </div>
      </div>

      {/* =====================================
          ENVIRONMENT CARDS
      ====================================== */}

      {latestReading && (
        <div className="environment-cards">

          <div className="environment-card">
            <span>🌡️</span>

            <div>
              <small>Temperature</small>

              <strong>
                {formatValue(
                  latestReading.temperature,
                  " °C"
                )}
              </strong>
            </div>
          </div>

          <div className="environment-card">
            <span>🌧️</span>

            <div>
              <small>Rainfall</small>

              <strong>
                {formatValue(
                  latestReading.rainfall,
                  " mm"
                )}
              </strong>
            </div>
          </div>

          <div className="environment-card">
            <span>🌬️</span>

            <div>
              <small>Air Quality</small>

              <strong>
                {formatValue(
                  latestReading.air_quality
                )}
              </strong>
            </div>
          </div>

          <div className="environment-card">
            <span>🌱</span>

            <div>
              <small>Soil Moisture</small>

              <strong>
                {formatValue(
                  latestReading.soil_moisture
                )}
              </strong>
            </div>
          </div>

        </div>
      )}

      {/* =====================================
          WEATHER CHARTS
      ====================================== */}

      <div className="environment-charts">

        {/* Temperature */}

        <div className="chart-card">

          <div className="chart-header">

            <div>
              <h3>Temperature Trend</h3>

              <p>
                Temperature readings over time
              </p>
            </div>

            <span className="chart-icon">
              🌡️
            </span>

          </div>

          {chartData.length === 0 ? (
            <div className="chart-empty">
              No temperature data available yet.
            </div>
          ) : (
            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <LineChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="date" />

                  <YAxis unit="°C" />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature"
                    stroke="#2e8b57"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>
          )}

        </div>

        {/* Rainfall */}

        <div className="chart-card">

          <div className="chart-header">

            <div>
              <h3>Rainfall Trend</h3>

              <p>
                Rainfall readings over time
              </p>
            </div>

            <span className="chart-icon">
              🌧️
            </span>

          </div>

          {chartData.length === 0 ? (
            <div className="chart-empty">
              No rainfall data available yet.
            </div>
          ) : (
            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <LineChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="date" />

                  <YAxis unit=" mm" />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="rainfall"
                    name="Rainfall"
                    stroke="#3182ce"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>
          )}

        </div>

      </div>

      {/* =====================================
          BIODIVERSITY
      ====================================== */}

      <section className="biodiversity-section">

        <div className="biodiversity-header">

          <div>
            <span className="welcome-label">
              BIODIVERSITY
            </span>

            <h2>Recorded Biodiversity</h2>

            <p>
              Species observations recorded around the
              selected monitoring site.
            </p>
          </div>

          {selectedSiteData && (
            <div className="biodiversity-location">
              📍 {selectedSiteData.latitude},{" "}
              {selectedSiteData.longitude}
              <br />
              Search radius: 25 km
            </div>
          )}

        </div>

        {loadingBiodiversity ? (

          <div className="biodiversity-loading">
            <div className="empty-icon">
              🦋
            </div>

            <h3>
              Loading biodiversity data...
            </h3>

            <p>
              Fetching recorded species observations.
            </p>
          </div>

        ) : biodiversity ? (

          <>

            {/* Biodiversity Cards */}

            <div className="biodiversity-cards">

              <div className="biodiversity-card">

                <span>🧬</span>

                <div>
                  <small>
                    Recorded Species
                  </small>

                  <strong>
                    {biodiversity.recorded_species}
                  </strong>
                </div>

              </div>

              <div className="biodiversity-card">

                <span>📊</span>

                <div>
                  <small>
                    Occurrence Records
                  </small>

                  <strong>
                    {biodiversity.total_occurrences}
                  </strong>
                </div>

              </div>

              <div className="biodiversity-card">

                <span>🌿</span>

                <div>
                  <small>Plants</small>

                  <strong>
                    {plants}
                  </strong>
                </div>

              </div>

              <div className="biodiversity-card">

                <span>🐦</span>

                <div>
                  <small>Animal Species</small>

                  <strong>
                    {animals}
                  </strong>
                </div>

              </div>

            </div>

            {/* Species Table */}

            <div className="biodiversity-table-card">

              <div className="projects-top">

                <div>
                  <h2>
                    Observed Species
                  </h2>

                  <p>
                    Species recorded in the selected
                    monitoring site's search area.
                  </p>
                </div>

              </div>

              {biodiversity.species &&
              biodiversity.species.length > 0 ? (

                <div className="environment-table-wrapper">

                  <table className="environment-table">

                    <thead>
                      <tr>
                        <th>Species</th>
                        <th>Common Name</th>
                        <th>Category</th>
                        <th>Order</th>
                        <th>Observations</th>
                      </tr>
                    </thead>

                    <tbody>

                      {biodiversity.species
                        .slice()
                        .sort(
                          (a, b) =>
                            b.observation_count -
                            a.observation_count
                        )
                        .map((species, index) => (

                          <tr
                            key={`${species.scientific_name}-${index}`}
                          >

                            <td>
                              <em>
                                {
                                  species.scientific_name
                                }
                              </em>
                            </td>

                            <td>
                              {species.common_name ||
                                "—"}
                            </td>

                            <td>
                              {getSpeciesCategory(
                                species
                              )}
                            </td>

                            <td>
                              {species.order ||
                                "—"}
                            </td>

                            <td>
                              {
                                species.observation_count
                              }
                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="chart-empty">
                  No species observations found.
                </div>

              )}

            </div>

          </>

        ) : (

          <div className="biodiversity-loading">

            <div className="empty-icon">
              🌍
            </div>

            <h3>
              Biodiversity data unavailable
            </h3>

            <p>
              We could not retrieve recorded species
              observations for this site.
            </p>

          </div>

        )}

      </section>

      {/* =====================================
          ENVIRONMENTAL HISTORY
      ====================================== */}

      <section className="environment-table-section">

        <div className="projects-top">

          <div>
            <h2>
              Environmental History
            </h2>

            <p>
              Recorded environmental readings for the
              selected monitoring site.
            </p>
          </div>

        </div>

        {loadingReadings ? (

          <div className="empty-projects">
            Loading environmental data...
          </div>

        ) : readings.length === 0 ? (

          <div className="empty-projects">

            <div className="empty-icon">
              🌍
            </div>

            <h3>
              No readings yet
            </h3>

            <p>
              Click "Fetch Latest Data" to retrieve
              environmental data for this site.
            </p>

          </div>

        ) : (

          <div className="environment-table-wrapper">

            <table className="environment-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Temperature</th>
                  <th>Rainfall</th>
                  <th>Air Quality</th>
                  <th>Soil Moisture</th>
                </tr>
              </thead>

              <tbody>

                {readings
                  .slice()
                  .reverse()
                  .map((reading) => (

                    <tr key={reading.id}>

                      <td>
                        {formatDate(
                          reading.recorded_at
                        )}
                      </td>

                      <td>
                        {formatValue(
                          reading.temperature,
                          " °C"
                        )}
                      </td>

                      <td>
                        {formatValue(
                          reading.rainfall,
                          " mm"
                        )}
                      </td>

                      <td>
                        {formatValue(
                          reading.air_quality
                        )}
                      </td>

                      <td>
                        {formatValue(
                          reading.soil_moisture
                        )}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </section>
  );
}

export default EnvironmentalMonitoring;