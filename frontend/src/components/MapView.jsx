import { useEffect, useRef, useState } from "react";
import {
  setOptions,
  importLibrary,
} from "@googlemaps/js-api-loader";

import { getSites } from "../api";

const API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function MapView() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState("");
  const [sitesError, setSitesError] = useState("");

  useEffect(() => {
    async function loadSites() {
      try {
        const data = await getSites();
        setSites(data);
      } catch (error) {
        console.error(error);
        setSitesError(error.message);
      }
    }

    loadSites();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      try {
        if (!API_KEY) {
          throw new Error(
            "Google Maps API key is missing."
          );
        }

        setOptions({
          key: API_KEY,
          v: "weekly",
        });

        const { Map, InfoWindow } =
          await importLibrary("maps");

        const { AdvancedMarkerElement } =
          await importLibrary("marker");

        if (cancelled || !mapRef.current) {
          return;
        }

        const defaultCenter = {
          lat: 14.4644,
          lng: 75.9218,
        };

        const map = new Map(mapRef.current, {
          center: defaultCenter,
          zoom: 6,
          mapId: "DEMO_MAP_ID",

          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        const infoWindow = new InfoWindow();

        function addSiteMarkers() {
          markersRef.current.forEach(
            (marker) => {
              marker.map = null;
            }
          );

          markersRef.current = [];

          sites.forEach((site) => {
            const marker =
              new AdvancedMarkerElement({
                map,
                position: {
                  lat: Number(site.latitude),
                  lng: Number(site.longitude),
                },
                title: site.name,
              });

            marker.addListener(
              "gmp-click",
              () => {
                infoWindow.setContent(`
                  <div style="padding:8px; min-width:180px;">
                    <h3 style="margin:0 0 6px;">
                      ${site.name}
                    </h3>

                    <p style="margin:4px 0;">
                      <strong>Area:</strong>
                      ${site.area_hectares} ha
                    </p>

                    <p style="margin:4px 0;">
                      <strong>Latitude:</strong>
                      ${site.latitude}
                    </p>

                    <p style="margin:4px 0;">
                      <strong>Longitude:</strong>
                      ${site.longitude}
                    </p>

                    <p style="margin:4px 0;">
                      ${
                        site.description ||
                        "No description"
                      }
                    </p>
                  </div>
                `);

                infoWindow.open({
                  map,
                  anchor: marker,
                });
              }
            );

            markersRef.current.push(marker);
          });
        }

        addSiteMarkers();

        setLoading(false);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setMapError(
            error.message ||
              "Unable to load Google Maps."
          );

          setLoading(false);
        }
      }
    }

    initializeMap();

    return () => {
      cancelled = true;

      markersRef.current.forEach(
        (marker) => {
          marker.map = null;
        }
      );

      markersRef.current = [];
    };
  }, [sites]);

  function goToCurrentLocation() {
    if (!navigator.geolocation) {
      setMapError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(
            location
          );

          mapInstanceRef.current.setZoom(15);
        }
      },
      () => {
        setMapError(
          "Please allow location access in your browser."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }

  return (
    <div className="map-view-wrapper">

      <div className="map-header">

        <div>
          <h2>Map View</h2>

          <p>
            View environmental monitoring sites
            across your projects.
          </p>
        </div>

        <button
          className="map-location-button"
          onClick={goToCurrentLocation}
        >
          📍 My Location
        </button>

      </div>

      {sitesError && (
        <div className="error-message">
          {sitesError}
        </div>
      )}

      <div className="map-container">

        {loading && (
          <div className="map-loading">
            Loading Google Maps...
          </div>
        )}

        {mapError && (
          <div className="map-error">
            <strong>
              Map Error
            </strong>

            <p>
              {mapError}
            </p>
          </div>
        )}

        <div
          ref={mapRef}
          className="google-map"
        />

      </div>

      <div className="map-site-count">
        <span>📍</span>

        <strong>
          {sites.length}
        </strong>

        <span>
          monitoring site
          {sites.length === 1
            ? ""
            : "s"}
        </span>
      </div>

    </div>
  );
}

export default MapView;