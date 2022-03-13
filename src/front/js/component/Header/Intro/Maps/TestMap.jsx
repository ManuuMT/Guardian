import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../../../store/appContext.js";

// We will use these things from the lib
// https://react-google-maps-api-docs.netlify.com/
import {
  useLoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const TestMap = () => {
  const { store, actions } = useContext(Context);

  useEffect(() => {
    actions.getFetch();
  }, []);

  // The things we need to track in state
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [markerMap, setMarkerMap] = useState({});
  const [center, setCenter] = useState(store.mapCenter);
  const [zoom, setZoom] = useState(5);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [select, setSelect] =useState();


  // Load the Google maps scripts
  const { isLoaded } = useLoadScript({ googleMapsApiKey: store.api });

  useEffect(() => {
    console.log(`Loader: ${isLoaded}`);
  }, [isLoaded]);

  // Iterate myPlaces to size, center, and zoom map to contain all markers
  const fitBounds = (map) => {
    const bounds = new window.google.maps.LatLngBounds();
    store.database.map((place) => {
      bounds.extend(place.pos);
      return place.id;
    });
    map.fitBounds(bounds);
  };

  const loadHandler = (map) => {
    // Fit map bounds to contain all markers
    fitBounds(map);
  };

  // We have to create a mapping of our places to actual Marker objects
  const markerLoadHandler = (marker, place) => {
    return setMarkerMap((prevState) => {
      return { ...prevState, [place.id]: marker };
    });
  };

  const markerClickHandler = (event, place) => {
    // Remember which place was clicked
    setSelectedPlace(place);

    // Required so clicking a 2nd marker works as expected
    if (infoOpen) {
      setInfoOpen(false);
    }

    setInfoOpen(true);

    // If you want to zoom in a little on marker click
    if (zoom < 13) {
      setZoom(13);
    }

    // if you want to center the selected Marker
    setCenter(place.pos);
  };

  const chooseColor = (type) => {
    if (type == "Robo-Asalto") return "green";
    if (type == "Accidente-de-Transito") return "blue";
    if (type == "Pelea-Callejera") return "red";
  };

    const handleChange = event => {
        setSelect(event.target.value);
    }

    const changeCity = () => {
        if(select=="paris") setCenter(store.cities.paris);
        if(select=="madrid") setCenter(store.cities.madrid);
        if(select=="malaga") setCenter(store.cities.malaga);
        if(select=="berlin") setCenter(store.cities.berlin);
        setZoom(12);
    }

  const renderMap = () => {
    return (
      <>
        <GoogleMap
          // Do stuff on map initial laod
          onLoad={loadHandler}
          // Save the user's map click position
          onClick={(e) => setClickedLatLng(e.latLng.toJSON())}
          center={center}
          zoom={zoom}
          mapContainerStyle={{
            height: "70vh",
            width: "100%",
          }}
        >
          {store.database.map((place) => (
            <Marker
              key={place.id}
              position={place.pos}
              onLoad={(marker) => {
                const customIcon = (opts) =>
                  Object.assign(
                    {
                      path: "M12.75 0l-2.25 2.25 2.25 2.25-5.25 6h-5.25l4.125 4.125-6.375 8.452v0.923h0.923l8.452-6.375 4.125 4.125v-5.25l6-5.25 2.25 2.25 2.25-2.25-11.25-11.25zM10.5 12.75l-1.5-1.5 5.25-5.25 1.5 1.5-5.25 5.25z",
                      fillColor: "#34495e",
                      fillOpacity: 1,
                      strokeColor: "#000",
                      strokeWeight: 1,
                      scale: 1,
                    },
                    opts
                  );

                marker.setIcon(
                  customIcon({
                    fillColor: chooseColor(place.category),
                    strokeColor: "white",
                  })
                );
                return markerLoadHandler(marker, place);
              }}
              onClick={(event) => markerClickHandler(event, place)}
            />
          ))}

          {infoOpen && selectedPlace && (
            <InfoWindow
              anchor={markerMap[selectedPlace.id]}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div>
                <p>
                  <strong>{selectedPlace.id}</strong>
                </p>
                <div>
                  <p>
                    {selectedPlace.category}
                    <br></br>
                    {"- "}
                    {selectedPlace.name}
                    {": "}
                    <br></br>
                    {selectedPlace.text}
                  </p>
                </div>
          </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Position of the user's map click */}
        {clickedLatLng && (
          <h3>
            You clicked: {clickedLatLng.lat}, {clickedLatLng.lng}
          </h3>
        )}

        <select value={select} onChange={handleChange}>
            <option value="madrid">Madrid</option>
            <option value="malaga">Málaga</option>
            <option value="paris">París</option>
            <option value="berlin">Berlín</option>
        </select>
        
        <button className="btn btn-danger" onClick={() => changeCity()}>Cambiar ciudad</button>
        {/* Position of the user's map click */}
        {/*selectedPlace && <h3>Selected Marker: {selectedPlace.id}</h3>*/}
      </>
    );
  };

  return isLoaded ? renderMap() : null;
};

export default TestMap;
