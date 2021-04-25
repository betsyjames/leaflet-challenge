//URLs for data
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Initialize & Create Two Separate LayerGroups: earthquakes & tectonicPlates
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// Define all map layers
var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
  });

// Define baseMaps Object to Hold Base Layers
var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorsMap
};

// Create Overlay Object to Hold Overlay Layers
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicPlates
};

// Create Map, Passing In satelliteMap & earthquakes as Default Layers to Display on Load
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [satelliteMap, earthquakes]
});

// Create a layer control
//Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    }).addTo(myMap);

d3.json(earthquakesURL, function(earthquakeData) {
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
  // Define function to set the circle color based on the depth
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
    L.geoJSON(earthquakeData, {
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
    // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(earthquakes);
    // Add earthquakes Layer to the Map
    earthquakes.addTo(myMap);

    // Retrieve platesURL (Tectonic Plates GeoJSON Data) with D3
    d3.json(platesURL, function(plateData) {
        // Create a GeoJSON Layer the plateData
        L.geoJson(plateData, {
            color: "orange",
            weight: 2
        // Add plateData to tectonicPlates LayerGroups 
        }).addTo(tectonicPlates);
        // Add tectonicPlates Layer to the Map
        tectonicPlates.addTo(myMap);
    });

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
});