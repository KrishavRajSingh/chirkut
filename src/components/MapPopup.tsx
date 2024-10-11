import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from 'leaflet';

const MapPopup = ({ location }) => {
  // const [coordinates, setCoordinates] = useState<LatLngTuple>([51.505, -0.09]); // Default coordinates (London)

  // useEffect(() => {
  //   if (location) {
  //     fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
  //       .then(response => response.json())
  //       .then(data => {
  //         if (data && data.length > 0) {
  //           setCoordinates([data[0].lat, data[0].lon]);
  //         }
  //       });
  //   }
  // }, [location]);
  const le = document.querySelector<HTMLElement>(".leaflet-container");
  if(le)
  le.style.height = "100vh"

  return (
    <>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        </MapContainer>
    </>
  );
};

export default MapPopup;
