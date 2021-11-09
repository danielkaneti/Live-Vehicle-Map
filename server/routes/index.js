const express = require("express");
var turf = require("turf");
const route = express.Router();
const vehicleList = require("../db/vehicles-location.json");

route.get("/", (req, res, next) => {
  res.json(vehicleList);
});

route.post("/Polygon", (req, res, next) => {
  const Polygon = req.body;
  let PolygonJson = [];
  let newPoly = [];
  Polygon.data.forEach((item) => {
    newPoly.push([item.lat, item.lng]);
  });
  let firstPoint = [newPoly[0][0], newPoly[0][1]];

  newPoly.push(firstPoint);

  var poly = turf.polygon([newPoly]);
  vehicleList.forEach((vehicle) => {
    let lat = Number(vehicle.location.lat);
    let lng = Number(vehicle.location.lng);
    var pt = turf.point([lat, lng]);
    if (turf.inside(pt, poly)) {
      PolygonJson.push({ ...vehicle });
    }
  });
  res.json(PolygonJson);
});
module.exports = route;
