import { useEffect, useRef, useState } from "react";

import {
  setOptions,
  importLibrary,
} from "@googlemaps/js-api-loader";

import {
  getSites,
  getProjects,
  createSite,
  updateSite,
  deleteSite,
} from "../api";

const API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MAX_BOUNDARY_POINTS = 10;
const PLACE_SEARCH_RADIUS = 5000;


// =====================================================
// MAP VIEW
// =====================================================

function MapView() {

  // =====================================================
  // MAP REFERENCES
  // =====================================================

  const mapContainerRef =
    useRef(null);

  const mapRef =
    useRef(null);

  const AdvancedMarkerElementRef =
    useRef(null);

  const PolygonRef =
    useRef(null);

  const sphericalRef =
    useRef(null);

  const geocoderRef =
    useRef(null);

  const infoWindowRef =
    useRef(null);

  const siteMarkersRef =
    useRef([]);

  const sitePolygonsRef =
    useRef([]);

  const selectedMarkerRef =
    useRef(null);

  const searchMarkerRef =
    useRef(null);

  const drawingPolygonRef =
    useRef(null);

  const boundaryPointsRef =
    useRef([]);

  const isDrawingRef =
    useRef(false);


  // =====================================================
  // DATA
  // =====================================================

  const [sites, setSites] =
    useState([]);

  const [projects, setProjects] =
    useState([]);


  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [searching, setSearching] =
    useState(false);

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [boundaryPoints, setBoundaryPoints] =
    useState([]);


  // =====================================================
  // SELECTED LOCATION
  // =====================================================

  const [selectedLocation, setSelectedLocation] =
    useState(null);


  // =====================================================
  // SITE FORM
  // =====================================================

  const [siteName, setSiteName] =
    useState("");

  const [projectId, setProjectId] =
    useState("");

  const [areaHectares, setAreaHectares] =
    useState("");

  const [description, setDescription] =
    useState("");


  // =====================================================
  // LOAD SITES + PROJECTS
  // =====================================================

  useEffect(() => {

    async function loadData() {

      try {

        const [
          siteData,
          projectData,
        ] = await Promise.all([
          getSites(),
          getProjects(),
        ]);

        setSites(siteData);

        setProjects(projectData);

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Unable to load monitoring data."
        );
      }
    }

    loadData();

  }, []);


  // =====================================================
  // EDIT SITE NAME
  // =====================================================

  async function handleEditSite(site) {

    const newName =
      window.prompt(
        "Enter new monitoring site name:",
        site.name
      );

    if (
      newName === null
    ) {
      return;
    }

    const trimmedName =
      newName.trim();

    if (
      !trimmedName
    ) {
      setError(
        "Site name cannot be empty."
      );

      return;
    }

    try {

      setError("");

      const updatedSite =
        await updateSite(
          site.id,
          {
            name:
              trimmedName,
          }
        );

      setSites(
        (previousSites) =>
          previousSites.map(
            (item) =>
              item.id === updatedSite.id
                ? updatedSite
                : item
          )
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to update monitoring site."
      );
    }
  }


  // =====================================================
  // DELETE SITE
  // =====================================================

  async function handleDeleteSite(site) {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${site.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setError("");

      await deleteSite(
        site.id
      );

      setSites(
        (previousSites) =>
          previousSites.filter(
            (item) =>
              item.id !== site.id
          )
      );

      if (
        infoWindowRef.current
      ) {
        infoWindowRef.current.close();
      }

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to delete monitoring site."
      );
    }
  }


  // =====================================================
  // CREATE SITE POPUP
  // =====================================================

  function createSitePopupContent(
    site
  ) {

    const content =
      document.createElement(
        "div"
      );

    content.style.padding =
      "10px";

    content.style.minWidth =
      "240px";

    content.style.fontFamily =
      "Arial, sans-serif";


    // ---------------------------------------------------
    // TITLE
    // ---------------------------------------------------

    const title =
      document.createElement(
        "h3"
      );

    title.textContent =
      site.name;

    title.style.margin =
      "0 0 8px";

    title.style.color =
      "#0b633f";

    title.style.fontSize =
      "18px";


    // ---------------------------------------------------
    // AREA
    // ---------------------------------------------------

    const area =
      document.createElement(
        "p"
      );

    area.innerHTML =
      `<strong>Area:</strong> ${site.area_hectares} ha`;

    area.style.margin =
      "5px 0";


    // ---------------------------------------------------
    // DESCRIPTION
    // ---------------------------------------------------

    const descriptionElement =
      document.createElement(
        "p"
      );

    descriptionElement.textContent =
      site.description ||
      "No description";

    descriptionElement.style.margin =
      "7px 0";

    descriptionElement.style.color =
      "#667085";

    descriptionElement.style.lineHeight =
      "1.4";


    // ---------------------------------------------------
    // ACTIONS
    // ---------------------------------------------------

    const actions =
      document.createElement(
        "div"
      );

    actions.style.display =
      "flex";

    actions.style.gap =
      "8px";

    actions.style.marginTop =
      "12px";

    actions.style.flexWrap =
      "wrap";


    // ---------------------------------------------------
    // EDIT BUTTON
    // ---------------------------------------------------

    const editButton =
      document.createElement(
        "button"
      );

    editButton.type =
      "button";

    editButton.textContent =
      "✏️ Edit Name";

    editButton.style.padding =
      "7px 10px";

    editButton.style.border =
      "1px solid #0b633f";

    editButton.style.borderRadius =
      "6px";

    editButton.style.background =
      "#ffffff";

    editButton.style.color =
      "#0b633f";

    editButton.style.cursor =
      "pointer";

    editButton.style.fontSize =
      "13px";


    editButton.addEventListener(
      "click",
      async () => {

        await handleEditSite(
          site
        );
      }
    );


    // ---------------------------------------------------
    // DELETE BUTTON
    // ---------------------------------------------------

    const deleteButton =
      document.createElement(
        "button"
      );

    deleteButton.type =
      "button";

    deleteButton.textContent =
      "🗑️ Delete";

    deleteButton.style.padding =
      "7px 10px";

    deleteButton.style.border =
      "none";

    deleteButton.style.borderRadius =
      "6px";

    deleteButton.style.background =
      "#dc3545";

    deleteButton.style.color =
      "#ffffff";

    deleteButton.style.cursor =
      "pointer";

    deleteButton.style.fontSize =
      "13px";


    deleteButton.addEventListener(
      "click",
      async () => {

        await handleDeleteSite(
          site
        );
      }
    );


    // ---------------------------------------------------
    // BUILD POPUP
    // ---------------------------------------------------

    actions.appendChild(
      editButton
    );

    actions.appendChild(
      deleteButton
    );

    content.appendChild(
      title
    );

    content.appendChild(
      area
    );

    content.appendChild(
      descriptionElement
    );

    content.appendChild(
      actions
    );


    return content;
  }


  // =====================================================
  // LOOK UP LOCATION NAME
  // =====================================================

  async function lookupLocationName(
    location,
    marker = null
  ) {

    try {

      const Place =
        window.__darukaaPlace;

      let placeName =
        "";

      let address =
        "";

      let placeObject =
        null;


      // =================================================
      // 1. SEARCH NEARBY PLACES
      // =================================================

      if (Place) {

        try {

          const {
            places,
          } =
            await Place.searchNearby({

              fields: [
                "displayName",
                "formattedAddress",
                "location",
                "googleMapsURI",
              ],

              locationRestriction: {
                center:
                  location,

                radius:
                  PLACE_SEARCH_RADIUS,
              },

              maxResultCount:
                10,

              rankPreference:
                "DISTANCE",
            });


          if (
            places &&
            places.length > 0
          ) {

            placeObject =
              places[0];

            placeName =
              placeObject.displayName ||
              "";

            address =
              placeObject.formattedAddress ||
              "";
          }

        } catch (nearbyError) {

          console.warn(
            "Nearby place search failed:",
            nearbyError
          );
        }
      }


      // =================================================
      // 2. FALLBACK: REVERSE GEOCODING
      // =================================================

      if (
        !placeName
      ) {

        if (
          !geocoderRef.current
        ) {

          throw new Error(
            "Google Geocoder is not available."
          );
        }


        const response =
          await geocoderRef.current.geocode({
            location,
          });


        const results =
          response.results ||
          [];


        if (
          results.length > 0
        ) {

          const result =
            results[0];

          address =
            result.formatted_address ||
            "";


          const preferredTypes = [
            "point_of_interest",
            "establishment",
            "park",
            "natural_feature",
            "premise",
            "sublocality",
            "locality",
            "administrative_area_level_2",
          ];


          for (
            const component
            of result.address_components ||
            []
          ) {

            if (
              component.types.some(
                (type) =>
                  preferredTypes.includes(
                    type
                  )
              )
            ) {

              placeName =
                component.long_name;

              break;
            }
          }


          if (
            !placeName
          ) {

            placeName =
              result.formatted_address ||
              "";
          }
        }
      }


      // =================================================
      // 3. FINAL FALLBACK
      // =================================================

      if (
        !placeName
      ) {

        placeName =
          "Unnamed Monitoring Area";
      }


      // =================================================
      // FILL SITE NAME
      // =================================================

      setSiteName(
        placeName
      );


      // =================================================
      // SHOW LOCATION POPUP
      // =================================================

      if (
        infoWindowRef.current &&
        mapRef.current
      ) {

        const content =
          document.createElement(
            "div"
          );

        content.style.padding =
          "12px";

        content.style.minWidth =
          "250px";

        content.style.fontFamily =
          "Arial, sans-serif";


        const title =
          document.createElement(
            "h3"
          );

        title.textContent =
          placeName;

        title.style.margin =
          "0 0 8px";

        title.style.color =
          "#0b633f";


        const addressElement =
          document.createElement(
            "p"
          );

        addressElement.textContent =
          address ||
          "Location detected from map coordinates.";

        addressElement.style.margin =
          "5px 0";

        addressElement.style.color =
          "#667085";


        const note =
          document.createElement(
            "p"
          );

        note.textContent =
          "Suggested site name";

        note.style.margin =
          "8px 0 0";

        note.style.color =
          "#0b633f";

        note.style.fontSize =
          "12px";


        content.appendChild(
          title
        );

        content.appendChild(
          addressElement
        );

        content.appendChild(
          note
        );


        infoWindowRef.current.setContent(
          content
        );


        if (
          marker
        ) {

          infoWindowRef.current.open({
            map:
              mapRef.current,

            anchor:
              marker,
          });

        } else {

          infoWindowRef.current.setPosition(
            location
          );

          infoWindowRef.current.open({
            map:
              mapRef.current,
          });
        }
      }

    } catch (err) {

      console.error(
        "Location lookup failed:",
        err
      );

      setSiteName(
        "Unnamed Monitoring Area"
      );
    }
  }


  // =====================================================
  // INITIALIZE GOOGLE MAP
  // =====================================================

  useEffect(() => {

    let cancelled =
      false;


    async function initializeMap() {

      try {

        if (
          !API_KEY
        ) {

          throw new Error(
            "Google Maps API key is missing."
          );
        }


        setOptions({
          key:
            API_KEY,

          v:
            "weekly",
        });


        const [
          {
            Map,
            InfoWindow,
            Polygon,
          },

          {
            AdvancedMarkerElement,
          },

          {
            Place,
          },

          {
            spherical,
          },

          {
            Geocoder,
          },

        ] =
          await Promise.all([

            importLibrary(
              "maps"
            ),

            importLibrary(
              "marker"
            ),

            importLibrary(
              "places"
            ),

            importLibrary(
              "geometry"
            ),

            importLibrary(
              "geocoding"
            ),

          ]);


        if (
          cancelled ||
          !mapContainerRef.current
        ) {

          return;
        }


        AdvancedMarkerElementRef.current =
          AdvancedMarkerElement;

        PolygonRef.current =
          Polygon;

        sphericalRef.current =
          spherical;

        geocoderRef.current =
          new Geocoder();


        // =================================================
        // DEFAULT CENTER
        // =================================================

        const defaultCenter = {
          lat:
            14.4644,

          lng:
            75.9218,
        };


        // =================================================
        // CREATE MAP
        // =================================================

        const map =
          new Map(
            mapContainerRef.current,
            {

              center:
                defaultCenter,

              zoom:
                6,

              mapId:
                "DEMO_MAP_ID",

              gestureHandling:
                "greedy",

              draggable:
                true,

              scrollwheel:
                true,

              fullscreenControl:
                true,

              streetViewControl:
                false,

              mapTypeControl:
                true,

              zoomControl:
                true,

            }
          );


        mapRef.current =
          map;


        const infoWindow =
          new InfoWindow();


        infoWindowRef.current =
          infoWindow;


        // =================================================
        // MAP CLICK
        // =================================================

        map.addListener(
          "click",
          (event) => {

            if (
              !event.latLng
            ) {

              return;
            }


            const location = {

              lat:
                event.latLng.lat(),

              lng:
                event.latLng.lng(),

            };


            // =================================================
            // DRAWING MODE
            // =================================================

            if (
              isDrawingRef.current
            ) {

              if (
                boundaryPointsRef.current.length >=
                MAX_BOUNDARY_POINTS
              ) {

                setError(
                  `Maximum ${MAX_BOUNDARY_POINTS} boundary points allowed.`
                );

                return;
              }


              const updatedPoints = [

                ...boundaryPointsRef.current,

                location,

              ];


              boundaryPointsRef.current =
                updatedPoints;


              setBoundaryPoints(
                updatedPoints
              );


              setError(
                ""
              );


              // =================================================
              // DRAW TEMPORARY POLYGON
              // =================================================

              if (
                PolygonRef.current
              ) {

                if (
                  !drawingPolygonRef.current
                ) {

                  drawingPolygonRef.current =
                    new PolygonRef.current({

                      paths:
                        updatedPoints,

                      map,

                      strokeColor:
                        "#0b633f",

                      strokeOpacity:
                        0.9,

                      strokeWeight:
                        3,

                      fillColor:
                        "#0b633f",

                      fillOpacity:
                        0.18,

                      clickable:
                        false,

                    });

                } else {

                  drawingPolygonRef.current.setPath(
                    updatedPoints
                  );
                }
              }


              return;
            }


            // =================================================
            // NORMAL MAP CLICK
            // =================================================

            setSelectedLocation(
              location
            );


            setShowForm(
              true
            );


            setError(
              ""
            );


            if (
              selectedMarkerRef.current
            ) {

              selectedMarkerRef.current.map =
                null;

              selectedMarkerRef.current =
                null;
            }


            const selectedMarker =
              new AdvancedMarkerElement({

                map,

                position:
                  location,

                title:
                  "Selected monitoring location",

                gmpClickable:
                  true,

              });


            selectedMarkerRef.current =
              selectedMarker;


            selectedMarker.addListener(
              "gmp-click",
              () => {

                lookupLocationName(
                  location,
                  selectedMarker
                );
              }
            );


            lookupLocationName(
              location,
              selectedMarker
            );


            map.panTo(
              location
            );
          }
        );


        // =================================================
        // CURRENT LOCATION
        // =================================================

        if (
          "geolocation" in
          navigator
        ) {

          navigator.geolocation.getCurrentPosition(

            (position) => {

              if (
                cancelled ||
                !mapRef.current
              ) {

                return;
              }


              mapRef.current.setCenter({

                lat:
                  position.coords.latitude,

                lng:
                  position.coords.longitude,

              });


              mapRef.current.setZoom(
                13
              );
            },

            () => {

              console.log(
                "Location permission not granted."
              );
            },

            {

              enableHighAccuracy:
                true,

              timeout:
                10000,

              maximumAge:
                30000,

            }
          );
        }


        // Save Place
        window.__darukaaPlace =
          Place;


        setLoading(
          false
        );

      } catch (err) {

        console.error(
          err
        );


        if (
          !cancelled
        ) {

          setError(
            err.message ||
            "Unable to load Google Maps."
          );

          setLoading(
            false
          );
        }
      }
    }


    initializeMap();


    return () => {

      cancelled =
        true;


      if (
        selectedMarkerRef.current
      ) {

        selectedMarkerRef.current.map =
          null;
      }


      if (
        searchMarkerRef.current
      ) {

        searchMarkerRef.current.map =
          null;
      }


      siteMarkersRef.current.forEach(
        (marker) => {
          marker.map =
            null;
        }
      );


      siteMarkersRef.current =
        [];


      sitePolygonsRef.current.forEach(
        (polygon) => {
          polygon.setMap(
            null
          );
        }
      );


      sitePolygonsRef.current =
        [];


      if (
        drawingPolygonRef.current
      ) {

        drawingPolygonRef.current.setMap(
          null
        );
      }


      drawingPolygonRef.current =
        null;

    };

  }, []);


  // =====================================================
  // RENDER SAVED SITES
  // =====================================================

  useEffect(() => {

    const map =
      mapRef.current;

    const AdvancedMarkerElement =
      AdvancedMarkerElementRef.current;

    const Polygon =
      PolygonRef.current;

    const infoWindow =
      infoWindowRef.current;


    if (
      !map ||
      !AdvancedMarkerElement ||
      !Polygon ||
      !infoWindow
    ) {

      return;
    }


    // =================================================
    // REMOVE OLD MARKERS
    // =================================================

    siteMarkersRef.current.forEach(
      (marker) => {
        marker.map =
          null;
      }
    );


    siteMarkersRef.current =
      [];


    // =================================================
    // REMOVE OLD POLYGONS
    // =================================================

    sitePolygonsRef.current.forEach(
      (polygon) => {
        polygon.setMap(
          null
        );
      }
    );


    sitePolygonsRef.current =
      [];


    // =================================================
    // ADD SITES
    // =================================================

    sites.forEach(
      (site) => {

        const position = {

          lat:
            Number(
              site.latitude
            ),

          lng:
            Number(
              site.longitude
            ),

        };


        // =================================================
        // SITE MARKER
        // =================================================

        const marker =
          new AdvancedMarkerElement({

            map,

            position,

            title:
              site.name,

            gmpClickable:
              true,

          });


        marker.addListener(
          "gmp-click",
          () => {

            const content =
              createSitePopupContent(
                site
              );


            infoWindow.setContent(
              content
            );


            infoWindow.open({

              map,

              anchor:
                marker,

            });
          }
        );


        siteMarkersRef.current.push(
          marker
        );


        // =================================================
        // SAVED POLYGON
        // =================================================

        if (

          site.boundary &&

          Array.isArray(
            site.boundary
          ) &&

          site.boundary.length >= 3

        ) {

          const polygon =
            new Polygon({

              paths:
                site.boundary,

              map,

              strokeColor:
                "#0b633f",

              strokeOpacity:
                0.9,

              strokeWeight:
                3,

              fillColor:
                "#0b633f",

              fillOpacity:
                0.18,

              clickable:
                true,

            });


          polygon.addListener(
            "click",
            () => {

              const content =
                createSitePopupContent(
                  site
                );


              infoWindow.setContent(
                content
              );


              infoWindow.setPosition(
                position
              );


              infoWindow.open({
                map,
              });
            }
          );


          sitePolygonsRef.current.push(
            polygon
          );
        }
      }
    );

  }, [sites]);


  // =====================================================
  // SEARCH LOCATION
  // =====================================================

  async function searchLocation() {

    const query =
      searchTerm.trim();


    if (
      !query
    ) {

      setError(
        "Enter a location to search."
      );

      return;
    }


    if (
      !mapRef.current
    ) {

      setError(
        "Map is still loading."
      );

      return;
    }


    try {

      setSearching(
        true
      );


      setError(
        ""
      );


      const Place =
        window.__darukaaPlace;


      if (
        !Place
      ) {

        throw new Error(
          "Google Places search is not available."
        );
      }


      const center =
        mapRef.current.getCenter();


      const request = {

        textQuery:
          query,

        fields: [

          "displayName",

          "formattedAddress",

          "location",

        ],

        locationBias:
          center
            ? {

                lat:
                  center.lat(),

                lng:
                  center.lng(),

              }

            : undefined,

        language:
          "en",

        region:
          "IN",

        maxResultCount:
          5,

      };


      const {
        places,
      } =
        await Place.searchByText(
          request
        );


      if (
        !places ||
        places.length === 0
      ) {

        setError(
          `No location found for "${query}".`
        );

        return;
      }


      const place =
        places[0];


      if (
        !place.location
      ) {

        setError(
          "The selected location has no coordinates."
        );

        return;
      }


      const location = {

        lat:
          place.location.lat(),

        lng:
          place.location.lng(),

      };


      mapRef.current.panTo(
        location
      );


      mapRef.current.setZoom(
        15
      );


      // Remove previous search marker
      if (
        searchMarkerRef.current
      ) {

        searchMarkerRef.current.map =
          null;
      }


      const AdvancedMarkerElement =
        AdvancedMarkerElementRef.current;


      const marker =
        new AdvancedMarkerElement({

          map:
            mapRef.current,

          position:
            location,

          title:
            place.displayName ||
            query,

          gmpClickable:
            true,

        });


      searchMarkerRef.current =
        marker;


      // Fill Site Name
      setSiteName(
        place.displayName ||
        place.formattedAddress ||
        ""
      );


      // Show popup
      if (
        infoWindowRef.current
      ) {

        const content =
          document.createElement(
            "div"
          );


        content.style.padding =
          "10px";

        content.style.minWidth =
          "230px";

        content.style.fontFamily =
          "Arial, sans-serif";


        const title =
          document.createElement(
            "h3"
          );

        title.textContent =
          place.displayName ||
          query;

        title.style.margin =
          "0 0 6px";

        title.style.color =
          "#0b633f";


        const address =
          document.createElement(
            "p"
          );

        address.textContent =
          place.formattedAddress ||
          "";

        address.style.margin =
          "4px 0";

        address.style.color =
          "#667085";


        content.appendChild(
          title
        );

        content.appendChild(
          address
        );


        infoWindowRef.current.setContent(
          content
        );


        infoWindowRef.current.open({

          map:
            mapRef.current,

          anchor:
            marker,

        });
      }

    } catch (err) {

      console.error(
        err
      );


      setError(
        err.message ||
        "Unable to search for this location."
      );

    } finally {

      setSearching(
        false
      );
    }
  }


  // =====================================================
  // SEARCH ENTER
  // =====================================================

  function handleSearchKeyDown(
    event
  ) {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      searchLocation();
    }
  }


  // =====================================================
  // START DRAWING
  // =====================================================

  function startDrawingBoundary() {

    if (
      !mapRef.current
    ) {

      setError(
        "Map is still loading."
      );

      return;
    }


    setError(
      ""
    );

    setShowForm(
      true
    );

    setIsDrawing(
      true
    );

    isDrawingRef.current =
      true;


    boundaryPointsRef.current =
      [];

    setBoundaryPoints(
      []
    );


    if (
      drawingPolygonRef.current
    ) {

      drawingPolygonRef.current.setMap(
        null
      );

      drawingPolygonRef.current =
        null;
    }


    if (
      selectedMarkerRef.current
    ) {

      selectedMarkerRef.current.map =
        null;

      selectedMarkerRef.current =
        null;
    }


    setSelectedLocation(
      null
    );

    setAreaHectares(
      ""
    );

    setSiteName(
      ""
    );
  }


  // =====================================================
  // FINISH DRAWING
  // =====================================================

  function finishDrawingBoundary() {

    const points =
      boundaryPointsRef.current;


    if (
      points.length < 3
    ) {

      setError(
        "Please select at least 3 points to create a boundary."
      );

      return;
    }


    setError(
      ""
    );

    setIsDrawing(
      false
    );

    isDrawingRef.current =
      false;


    // =================================================
    // CALCULATE CENTER
    // =================================================

    const center =
      points.reduce(
        (
          result,
          point
        ) => ({

          lat:
            result.lat +
            point.lat,

          lng:
            result.lng +
            point.lng,

        }),

        {
          lat:
            0,

          lng:
            0,
        }
      );


    const selectedCenter = {

      lat:
        center.lat /
        points.length,

      lng:
        center.lng /
        points.length,

    };


    setSelectedLocation(
      selectedCenter
    );


    // =================================================
    // CALCULATE AREA
    // =================================================

    try {

      if (
        sphericalRef.current &&
        drawingPolygonRef.current
      ) {

        const squareMeters =
          sphericalRef.current.computeArea(
            drawingPolygonRef.current.getPath()
          );


        const hectares =
          squareMeters /
          10000;


        setAreaHectares(
          hectares.toFixed(4)
        );
      }

    } catch (err) {

      console.error(
        "Area calculation failed:",
        err
      );
    }


    // =================================================
    // CENTER MARKER
    // =================================================

    if (
      selectedMarkerRef.current
    ) {

      selectedMarkerRef.current.map =
        null;
    }


    const AdvancedMarkerElement =
      AdvancedMarkerElementRef.current;


    if (
      AdvancedMarkerElement
    ) {

      const selectedMarker =
        new AdvancedMarkerElement({

          map:
            mapRef.current,

          position:
            selectedCenter,

          title:
            "Monitoring area center",

          gmpClickable:
            true,

        });


      selectedMarkerRef.current =
        selectedMarker;


      selectedMarker.addListener(
        "gmp-click",
        () => {

          lookupLocationName(
            selectedCenter,
            selectedMarker
          );
        }
      );


      lookupLocationName(
        selectedCenter,
        selectedMarker
      );
    }


    // =================================================
    // PAN TO CENTER
    // =================================================

    if (
      mapRef.current
    ) {

      mapRef.current.panTo(
        selectedCenter
      );

      mapRef.current.setZoom(
        15
      );
    }
  }


  // =====================================================
  // CLEAR BOUNDARY
  // =====================================================

  function clearBoundary() {

    boundaryPointsRef.current =
      [];

    setBoundaryPoints(
      []
    );

    setSelectedLocation(
      null
    );

    setAreaHectares(
      ""
    );

    setSiteName(
      ""
    );

    setIsDrawing(
      false
    );

    isDrawingRef.current =
      false;


    if (
      drawingPolygonRef.current
    ) {

      drawingPolygonRef.current.setMap(
        null
      );

      drawingPolygonRef.current =
        null;
    }


    if (
      selectedMarkerRef.current
    ) {

      selectedMarkerRef.current.map =
        null;

      selectedMarkerRef.current =
        null;
    }


    setError(
      ""
    );
  }


  // =====================================================
  // RESET FORM
  // =====================================================

  function resetForm() {

    setShowForm(
      false
    );

    setSelectedLocation(
      null
    );

    setSiteName(
      ""
    );

    setProjectId(
      ""
    );

    setAreaHectares(
      ""
    );

    setDescription(
      ""
    );

    clearBoundary();
  }


  // =====================================================
  // SAVE MONITORING SITE
  // =====================================================

  async function handleCreateSite(
    event
  ) {

    event.preventDefault();


    if (
      boundaryPointsRef.current.length < 3
    ) {

      setError(
        "Please draw the monitoring-site boundary first."
      );

      return;
    }


    if (
      !selectedLocation
    ) {

      setError(
        "Monitoring area center could not be determined."
      );

      return;
    }


    if (
      !projectId
    ) {

      setError(
        "Please select a project."
      );

      return;
    }


    if (
      !areaHectares
    ) {

      setError(
        "Area could not be calculated."
      );

      return;
    }


    if (
      !siteName.trim()
    ) {

      setError(
        "Please enter or select a site name."
      );

      return;
    }


    try {

      setSaving(
        true
      );

      setError(
        ""
      );


      const newSite =
        await createSite({

          name:
            siteName.trim(),

          latitude:
            selectedLocation.lat,

          longitude:
            selectedLocation.lng,

          area_hectares:
            Number(
              areaHectares
            ),

          description,

          project_id:
            Number(
              projectId
            ),

          boundary:
            boundaryPointsRef.current,

        });


      setSites(
        (previousSites) => [

          newSite,

          ...previousSites,

        ]
      );


      resetForm();

    } catch (err) {

      console.error(
        err
      );


      setError(
        err.message ||
        "Unable to save monitoring site."
      );

    } finally {

      setSaving(
        false
      );
    }
  }


  // =====================================================
  // CURRENT LOCATION
  // =====================================================

  function goToCurrentLocation() {

    if (
      !navigator.geolocation
    ) {

      setError(
        "Geolocation is not supported."
      );

      return;
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const location = {

          lat:
            position.coords.latitude,

          lng:
            position.coords.longitude,

        };


        if (
          mapRef.current
        ) {

          mapRef.current.setCenter(
            location
          );

          mapRef.current.setZoom(
            15
          );
        }
      },


      () => {

        setError(
          "Please allow location access in your browser."
        );
      },


      {

        enableHighAccuracy:
          true,

        timeout:
          10000,

        maximumAge:
          30000,

      }
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="map-view-wrapper">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="map-header">

        <div>

          <h2>
            Map View
          </h2>

          <p>
            Search a location or draw a
            monitoring area on the map.
          </p>

        </div>


        <div
          style={{
            display:
              "flex",

            gap:
              "10px",

            flexWrap:
              "wrap",
          }}
        >

          <button
            className="map-location-button"
            onClick={
              goToCurrentLocation
            }
          >
            📍 My Location
          </button>


          <button
            className="map-location-button"
            onClick={
              startDrawingBoundary
            }
          >
            ⬡ Draw Monitoring Area
          </button>

        </div>

      </div>


      {/* =================================================
          SEARCH BAR
      ================================================= */}

      <div className="map-search-bar">

        <div className="map-search-input">

          <span>
            🔍
          </span>


          <input
            type="text"
            placeholder="Search a location, city, address..."
            value={
              searchTerm
            }
            onChange={
              (event) =>
                setSearchTerm(
                  event.target.value
                )
            }
            onKeyDown={
              handleSearchKeyDown
            }
          />

        </div>


        <button
          className="map-search-button"
          onClick={
            searchLocation
          }
          disabled={
            searching
          }
        >

          {
            searching
              ? "Searching..."
              : "Search"
          }

        </button>

      </div>


      {/* =================================================
          DRAWING INFORMATION
      ================================================= */}

      {isDrawing && (

        <div
          style={{

            marginTop:
              "12px",

            padding:
              "14px 16px",

            borderRadius:
              "10px",

            background:
              "#eef8f2",

            border:
              "1px solid #b7dfc7",

            color:
              "#0b633f",

            fontWeight:
              "600",

          }}
        >

          Click points on the map
          to draw the monitoring
          boundary.


          <span
            style={{

              marginLeft:
                "8px",

              fontWeight:
                "400",

            }}
          >

            {
              boundaryPoints.length
            }

            {" "}point(s)
            selected.

            Click 5 points
            for a pentagon.

          </span>

        </div>
      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="error-message">

          {error}

        </div>
      )}


      {/* =================================================
          MAP
      ================================================= */}

      <div className="map-container">

        {loading && (

          <div className="map-loading">

            Loading Google Maps...

          </div>
        )}


        <div
          ref={
            mapContainerRef
          }
          className="google-map"
        />

      </div>


      {/* =================================================
          DRAWING ACTIONS
      ================================================= */}

      {(
        isDrawing ||
        boundaryPoints.length >= 3
      ) && (

        <div
          style={{

            display:
              "flex",

            gap:
              "10px",

            alignItems:
              "center",

            flexWrap:
              "wrap",

            marginTop:
              "12px",

          }}
        >

          {isDrawing && (

            <button
              type="button"
              className="add-project-button"
              onClick={
                finishDrawingBoundary
              }
              disabled={
                boundaryPoints.length < 3
              }
            >

              ✓ Finish Boundary

            </button>
          )}


          <button
            type="button"
            className="secondary-button"
            onClick={
              clearBoundary
            }
          >

            Clear Boundary

          </button>


          {boundaryPoints.length > 0 && (

            <span
              style={{

                color:
                  "#667085",

                fontSize:
                  "14px",

              }}
            >

              {
                boundaryPoints.length
              }

              {" "}boundary
              point(s)

            </span>
          )}

        </div>
      )}


      {/* =================================================
          SITE COUNT
      ================================================= */}

      <div className="map-site-count">

        <span>
          📍
        </span>


        <strong>
          {sites.length}
        </strong>


        <span>

          {
            sites.length === 1
              ? " monitoring site"
              : " monitoring sites"
          }

        </span>

      </div>


      {/* =================================================
          ADD SITE FORM
      ================================================= */}

      {showForm && (

        <div className="site-form-card">

          <div className="site-form-header">

            <div>

              <h3>
                Add Monitoring Site
              </h3>

              <p>
                Draw the monitoring boundary
                on the map.
              </p>

            </div>


            <button
              type="button"
              className="close-form-button"
              onClick={
                resetForm
              }
            >
              ×
            </button>

          </div>


          {/* =================================================
              BOUNDARY STATUS
          ================================================= */}

          <div
            style={{

              marginBottom:
                "15px",

              padding:
                "12px",

              borderRadius:
                "8px",

              background:

                boundaryPoints.length >= 3

                  ? "#eef8f2"

                  : "#f8f9fa",

              border:

                boundaryPoints.length >= 3

                  ? "1px solid #b7dfc7"

                  : "1px solid #e4e7ec",

            }}
          >

            <strong>
              Boundary:
            </strong>{" "}


            {
              boundaryPoints.length >= 3

                ? `${boundaryPoints.length} points selected`

                : "Not drawn yet"
            }

          </div>


          {/* =================================================
              SELECTED COORDINATES
          ================================================= */}

          {selectedLocation && (

            <div className="selected-coordinates">

              <div>

                <span>
                  Latitude
                </span>

                <strong>

                  {
                    selectedLocation.lat.toFixed(
                      6
                    )
                  }

                </strong>

              </div>


              <div>

                <span>
                  Longitude
                </span>

                <strong>

                  {
                    selectedLocation.lng.toFixed(
                      6
                    )
                  }

                </strong>

              </div>

            </div>
          )}


          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="site-form"
            onSubmit={
              handleCreateSite
            }
          >

            {/* SITE NAME */}

            <div className="form-field">

              <label>
                Site Name
              </label>


              <input
                type="text"
                placeholder="Google location name will appear here"
                value={
                  siteName
                }
                onChange={
                  (event) =>
                    setSiteName(
                      event.target.value
                    )
                }
                required
              />


              <small
                style={{

                  color:
                    "#667085",

                  display:
                    "block",

                  marginTop:
                    "5px",

                }}
              >

                Google suggests a nearby
                named place automatically.
                You can edit the name
                before saving.

              </small>

            </div>


            {/* PROJECT */}

            <div className="form-field">

              <label>
                Project
              </label>


              <select
                value={
                  projectId
                }
                onChange={
                  (event) =>
                    setProjectId(
                      event.target.value
                    )
                }
                required
              >

                <option value="">
                  Select a project
                </option>


                {
                  projects.map(
                    (project) => (

                      <option
                        key={
                          project.id
                        }
                        value={
                          project.id
                        }
                      >

                        {
                          project.name
                        }

                      </option>
                    )
                  )
                }

              </select>

            </div>


            {/* AREA */}

            <div className="form-field">

              <label>
                Area (hectares)
              </label>


              <input
                type="number"
                min="0.0001"
                step="0.0001"
                placeholder="Calculated from boundary"
                value={
                  areaHectares
                }
                onChange={
                  (event) =>
                    setAreaHectares(
                      event.target.value
                    )
                }
                required
              />


              <small
                style={{

                  color:
                    "#667085",

                  display:
                    "block",

                  marginTop:
                    "5px",

                }}
              >

                Area is automatically
                calculated from the polygon.

              </small>

            </div>


            {/* DESCRIPTION */}

            <div className="form-field">

              <label>
                Description
              </label>


              <textarea
                placeholder="Describe this monitoring location"
                value={
                  description
                }
                onChange={
                  (event) =>
                    setDescription(
                      event.target.value
                    )
                }
              />

            </div>


            {/* =================================================
                FORM BUTTONS
            ================================================= */}

            <div className="site-form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={
                  resetForm
                }
              >

                Cancel

              </button>


              <button
                type="submit"
                className="add-project-button"
                disabled={
                  saving ||
                  boundaryPoints.length < 3
                }
              >

                {
                  saving
                    ? "Saving..."
                    : "Save Monitoring Site"
                }

              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
}


export default MapView;