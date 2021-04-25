// Store our API endpoint inside queryUrl
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(earthquakesURL).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

// Define function to create the circle radius based on the magnitude
function radiusSize(magnitude) {
    if (magnitude === 0) {
        return 1;
    }
        return magnitude * 3;
    }

function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: circleColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: radiusSize(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
}
  // Define function to set the circle color based on the magnitude
  function circleColor(depth) {
    if (depth < 10) {
      return "#ccff33"
    }
    else if (depth < 30) {
      return "#ffff33"
    }
    else if (depth < 50) {
      return "#ffcc33"
    }
    else if (depth < 70) {
      return "#ff9933"
    }
    else if (depth < 90) {
      return "#ff6633"
    }
    else {
      return "#ff3333"
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
    },
    style: styleInfo,
    // Function to Run Once For Each feature in the features Array
    // Give Each feature a Popup Describing the Place & Time of the Earthquake
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h4>Location: " + feature.properties.place + 
        "<hr><p>Depth: " + (feature.geometry.coordinates[2]) + 
        "</p><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  });


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);

}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [darkmap, earthquakes]
  });

  function circleColor(depth) {
    if (depth < 10) {
      return "#ccff33"
    }
    else if (depth < 30) {
      return "#ffff33"
    }
    else if (depth < 50) {
      return "#ffcc33"
    }
    else if (depth < 70) {
      return "#ff9933"
    }
    else if (depth < 90) {
      return "#ff6633"
    }
    else {
      return "#ff3333"
    }
  }

  // Set Up Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend"), 
      depthLevels = [-10, 10, 30,50,70, 90];

      //div.innerHTML += "<h3>Magnitude</h3>"

      for (var i = 0; i < depthLevels.length; i++) {
          div.innerHTML +=
              '<i style="background: ' + circleColor(depthLevels[i] + 1) + '"></i> ' +
              depthLevels[i] + (depthLevels[i + 1] ? '&ndash;' + depthLevels[i + 1] + '<br>' : '+');
      }
      return div;
  };
  // Add Legend to the Map
legend.addTo(myMap);
}
