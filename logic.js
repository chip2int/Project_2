// Store our API endpoint inside liquefactionJSON
const liquefactionJSON = "./data/sf1.geoJSON";
const sfAreasJSON = "./data/sfdis.geoJSON";
const sfPopulation = "./data/hood_new.csv"

// Read the JSON files and the cvs data
d3.json(liquefactionJSON, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  const liquefactionFeature = createFeatures(data.features);
  d3.csv(sfPopulation, function(csv) {
    d3.json(sfAreasJSON, function(data) {
        createMap(liquefactionFeature, createAreaPopup(data.features, csv))
    });
  });
});

createFeatures = (data) => {
  // Create a GeoJSON layer containing the features array for the liquefaction data
  return L.geoJSON(data, {
    weight: 1
  });
}

createAreaPopup = (sfData, csv) => {
  createPopulationPopup = (feature, layer) => {
    for (i = 1; i < csv.length; ++i) {
      let row = csv[i];
      if (row.Field === feature.properties.nhood) {
        let str = "<h4> Area: " + row.Field + "</h4><hr>"
        str += "<p>"
        str += "Over 65: " + `${(row.Over65_Per * 100).toFixed(2)} %` + "</br>"
        str += "Over 85: " + `${(row.Over85_Per * 100).toFixed(2)} %`+ "</br>" 
        str += "Under 18: " +  `${(row.Under18_Per * 100).toFixed(2)} %`+ "</br>" 
        str += "Under 5: " +  `${(row.Under5_Per * 100).toFixed(2)} %` + "</br>"
        str += "Hazard Risk Score: " + row.Haz_Score + "</br>"
        str += "</p>"
        layer.bindPopup(str)
        break;
      }
    }
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  return L.geoJSON(sfData, {
    onEachFeature: createPopulationPopup,
    weight: 1,
    color: 'green'
  });
}

function createMap(liquefaction, neighborhood) {
  const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  const baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  const overlayMaps = {
    Liquefaction: liquefaction, 
    'SF Neighborhood': neighborhood
  };

  // Create our map, giving it the streetmap and liquefaction layers to display on load
  const myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 13,
    layers: [streetmap, liquefaction, neighborhood]
  });
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
    color: 'yellow'
  }).addTo(myMap);
}
