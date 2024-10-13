import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

const MapComponent = ({tasks}) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {  
    
    mapboxgl.accessToken =
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-122.3066, 47.6567], // starting position [lng, lat]
      zoom: 9, // starting zoom
      style: "mapbox://styles/mapbox/dark-v11",
    });

    mapRef.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          showUserLocation: true,
          trackUserLocation: true,
          showUserHeading: true
        })
      );

    if (Array.isArray(tasks)) {
        {tasks.map(task => (
            new mapboxgl.Marker()
            .setLngLat([task.location.lng, task.location.lat])
            .setPopup(
              new mapboxgl.Popup() // add popups
                .setHTML(
                  `<h3>${task.title}</h3>`
                )
            )
            .addTo(mapRef.current))
        )}
    }

  });

  return (
    <div
      style={{ height: "100%", width: "100%"}}
      ref={mapContainerRef}
      className="map-container"
    />
  );
};

export default MapComponent;
