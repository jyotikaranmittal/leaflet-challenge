// Create the 'basemap' tile layers for the map.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create the map object with center and zoom options.
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street]
});


// Fetch earthquake data and add to the map
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

// Create a baseMaps object to hold the map tile layers.
let baseMaps = {
    Street: street,
    Topography: topo
};

// Add the base layer to the map
street.addTo(myMap);

// Create a legend control object.
let legend = L.control({
    position: "bottomright"
});

// Legend setup to show color based on earthquake depth
legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Depth intervals and corresponding colors
    let depth_intervals = [-10, 10, 30, 50, 70, 90];
    let colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
    ];

    // Generate labels with colored squares for each depth interval
    for (let i = 0; i < depth_intervals.length; i++) {
        div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            depth_intervals[i] + (depth_intervals[i + 1] ? "&ndash;" + depth_intervals[i + 1] + "<br>" : "+");
    }

    return div;
};

legend.addTo(myMap);
    // Function to get color based on depth
    function getColor(depth) {
        if (depth <= 10) return "#98ee00";
        else if (depth <= 30) return "#d4ee00";
        else if (depth <= 50) return "#eecc00";
        else if (depth <= 70) return "#ee9c00";
        else if (depth <= 90) return "#ea822c";
        else return "#ea2c2c";
    }

    // Function to get radius based on magnitude
    function getRadius(magnitude) {
        if (magnitude < 1) return 1;
        else if (magnitude <= 3) return 5;
        else if (magnitude <= 5) return 10;
        else if (magnitude <= 7) return 20;
        else return 30;
    }

    // Function to style each earthquake marker
    function styleInfo(feature) {
        return {
            color: getColor(feature.geometry.coordinates[2]),
            weight: 1,
            fillOpacity: 0.7,
            fillColor: getColor(feature.geometry.coordinates[2]),
            radius: getRadius(feature.properties.mag)
        };
    }

    // Add earthquake markers to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "</h3><p>Location: " + feature.properties.place + "</p><p>" + feature.geometry.coordinates[0] + " " + feature.geometry.coordinates[1] +"</p>");
        }
    }).addTo(myMap);
});

// Fetch tectonic plates data and add to the map
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    L.geoJson(plate_data, {
        color: "orange",
        weight: 2
    }).addTo(myMap);
});

// Create overlayMaps object to hold additional layers (e.g., earthquakes, tectonic plates)
let overlayMaps = {
    Earthquakes: earthquakesLayer,
    TectonicPlates: tectonicPlatesLayer
};

// Create a layer control, pass in the baseMaps and overlayMaps, and add the layer control to the map.
L.control.layers(baseMaps, overlayMaps).addTo(myMap);
