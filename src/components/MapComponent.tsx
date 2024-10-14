import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import { Tile } from 'ol/layer';
import { OSM } from 'ol/source';
import "../style.css";
import { fromLonLat } from 'ol/proj';


const MapComponent = ({lon, lat, setShowMap}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObjRef = useRef<Map | null>(null);

  console.log("MapComponent.tsx: ", lon, lat);
  useEffect(() => {
    console.log(1);
    
    if (!mapRef.current) return;
    console.log(2);
    // console.log("MapComponent.tsx: ", lon, lat);
    
    mapObjRef.current = new Map({
      view: new View({
        center: fromLonLat([lon, lat]),
        zoom: 13,
      }),
      layers: [new Tile({ source: new OSM() })],
    });

    mapObjRef.current.setTarget(mapRef.current);

    return () => mapObjRef.current.setTarget('');
  }, []);

  useEffect(() => {
    // Update map center when lon or lat changes
    if (mapObjRef.current) {
      const view = mapObjRef.current.getView();
      view.setCenter(fromLonLat([lon, lat]));
    }
  }, [lon, lat]);

  return <div style={{position: "fixed",
    top: "8rem",
    bottom: 0,
    left: "25vw",}}>
      <div style={{display: "flex", backgroundColor: "floralwhite", color: "black", justifyContent: "space-between"}}>
        <h1>Map</h1>
        <button style={{backgroundColor: "red"}} onClick={() => setShowMap(false)}>X</button>
      </div>
    {/* <p>Longitude: {lon}</p>
    <p>Latitude: {lat}</p> */}
    <div className ="map" ref={mapRef} style={{
    width: "50vw",
height: "50vh"}}/>
{/* <h1>Map</h1> */}
  </div>
  // return ;
};

export default MapComponent;