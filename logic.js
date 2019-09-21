// Store our API endpoint inside queryUrl
var queryUrl = "./data/sf1.geoJSON";
var sfdisurl = "./data/sfdis.geoJSON";
var sfpop = "./data/hood_new.csv"


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  var earth = createFeatures(data.features);
  d3.csv(sfpop, function(csv) {
    d3.json(sfdisurl, function(data) {
      var sfwhatever = sfDis(data.features, csv);
        createMap(earth, sfwhatever)
        });
    });
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    weight: 1
  });

  // Sending our earthquakes layer to the createMap function
  return earthquakes
}

function sfDis(sfData, csv) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake

  function sfDis1(feature, layer) {
    for (i = 1; i < csv.length; ++i) {
      var row = csv[i];

      if (row.Field === feature.properties.nhood) {
        console.log("Row", row)
        // layer.bindPopup(
        //   "<h4> Area: " + row.Field + "</h4>" +
        //   "<h4> Over 65: " + row.Over65_Per + "</h4>" +
        //   "<h4> Over 85: " + row.Over85_Per + "</h4>" +
        //   "<h4> Under 18: " + row.Under18_Per + "</h4>" +
        //   "<h4> Under 5: " + row.Under5_Per + "</h4>" +
        //   "<h4> Hazard Risk Score: " + row.Haz_Score + "</h4>"
        //  );

        let str = "<p>"
        str += "Area: " + row.Field + "</br>"
        str += "Over 65: " + row.Over65_Per + "</br>"
        str += "Over 85: " + row.Over85_Per + "</br>" 
        str += "Under 18: " + row.Under18_Per + "</br>" 
        str += "Under 5: " + row.Under5_Per + "</br>"
        str += "Hazard Risk Score: " + row.Haz_Score + "</br>"
        str += "</p>"
        layer.bindPopup(str)
          
        break;
      }
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var sf = L.geoJSON(sfData, {
    onEachFeature: sfDis1,
    weight: 1,
    color: 'red'
  });

  // Sending our earthquakes layer to the createMap function
  return sf
}

function createMap(earthquakes, sf) {

  // Define streetmap and darkmap layers
  // console.log(earthquakes)
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes, sf: sf
  };



  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 13,
    layers: [streetmap, earthquakes, sf]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
    color: 'yellow'
  }).addTo(myMap);
}
