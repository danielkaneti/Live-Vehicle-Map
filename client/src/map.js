import React, { useState, useRef, useEffect } from "react";
// import GoogleMapReact from "google-map-react";
import * as L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import axios from "axios";

const Map = () => {
  const LMap = useRef();
  const [mapObject, setMapObject] = useState();
  const [layerObject, setLayerObject] = useState();
  const [VehicleList, setVehicleList] = useState([]);
  const [selectedVehicleList, setSelectedVehicleList] = useState([]);
  const [allCreatedMarkers, setAllCreatedMarkers] = useState({});
  var theMarker = {};

  useEffect(() => {
    axios.get("http://localhost:4000").then((res) => setVehicleList(res.data));
  }, []);

  useEffect(() => {
    if (!mapObject) {
      const map = L.map("map", {
        drawControl: false,
       center: [51.444961547, -0.156384989],
       zoom: 13,
     });
 
      var options = {
         position: 'topleft',
         draw: {
             polygon: {
                 allowIntersection: false, // Restricts shapes to simple polygons
             },
             circle: false, // Turns off this drawing tool
             rectangle: false,
             circlemarker:false,
             marker: false,
             polyline: false
         },
     };
     
     var drawControl = new L.Control.Draw(options);
     map.addControl(drawControl);
 
     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
       attribution:
         'Data © <a href="http://osm.org/copyright">OpenStreetMap</a>',
       maxZoom: 18,
     }).addTo(map);
 
     setMapObject(map);
    }
 
  }, []);

  useEffect(() => {
    if (mapObject != undefined) {
      mapObject.on(L.Draw.Event.CREATED, function (e) {
        var  layer = e.layer;
        mapObject.addLayer(layer);
        setLayerObject(layer);

        mapObject.removeLayer(theMarker);
      });
    }
  }, [mapObject]);

  useEffect(() => {
    if (layerObject != undefined) {
      axios
        .post("http://localhost:4000/Polygon", {
          data: layerObject._latlngs[0],
        })
        .then((res) => {
          setSelectedVehicleList(res.data);
        });
    }
  }, [layerObject]);

  useEffect(() => {
    if (VehicleList != undefined) {
      createMarkerIcon(VehicleList, mapObject, false);
    }
  }, [VehicleList]);

  useEffect(() => {
    if (selectedVehicleList != undefined) {
      createMarkerIcon(selectedVehicleList, mapObject, true);
    }
  }, [selectedVehicleList]);

  const createMarkerIcon = (_VehicleList, mapObject, isOnlySelected) => {
    var icon = L.divIcon({
      iconSize: null,

      html: '<img src="./blueIcon.png"/>',
    });

    var unselectedIcon = L.divIcon({
      iconSize: null,
      html: '<img src="./icon.png"/>',
    });

    if (isOnlySelected == false) {
      let currentVeList = {};
      _VehicleList.forEach((vec) => {
        var pos = new L.LatLng(vec.location.lat, vec.location.lng);
        var marker = L.marker(pos, { icon: icon }).addTo(mapObject);
     
        marker.markerId = vec.id;
        currentVeList[vec.id] = marker;
      });
      console.log("currentVeList", currentVeList);
      setAllCreatedMarkers(currentVeList);
    } else {
      if (allCreatedMarkers != undefined) {
        let myObjMarker = Object.values(allCreatedMarkers);
        myObjMarker.forEach((item) => {
          let element = _VehicleList.find((x) => x.id == item.markerId);
          if (element == undefined) {
            console.log(item);
            item.setIcon(icon);
            item.unbindTooltip(item);
            
           mapObject.removeLayer(layerObject);
          }
          else{
            item.setIcon(unselectedIcon);
            item.bindTooltip(item.markerId, {permanent: true, className: "my-label", offset: [0, 0] })
            
            
          }
        });
      }
    }
  };

  return (
    <div ref={LMap} id="map" style={{ height: "100vh", width: "100vw" }}></div>
  );
};

export default Map;
