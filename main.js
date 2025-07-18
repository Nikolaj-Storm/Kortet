// Global variables
var markers = [];
var map;
var heatmap;


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {
            lat: 55.79589591931234,
            lng: 10.537624514446122
        },
        options: {
            gestureHandling: 'greedy'
        }
    });

    // Source: https://snazzymaps.com/
    var mutedStyle = [
        { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
        // ... (styles omitted for brevity) ...
    ];
    map.setOptions({ styles: mutedStyle });

    showMarkers(map);
    renderHeatMap();
}

function showMarkers(map) {
    for (var i in PLACEMARKS) {
        var placemark = PLACEMARKS[i];
        // Skip entries without valid coordinates
        if (placemark.latitude === null || placemark.longitude === null) {
            console.warn(
                `Skipping placemark "${placemark.title}" due to invalid coordinates`,
                placemark
            );
            continue;
        }
        var image = {
            url: placemark.imageUrl,
            scaledSize: new google.maps.Size(18, 18)
        };

        var markerLocation = {
            lat: placemark.latitude,
            lng: placemark.longitude
        };

        var marker = new google.maps.Marker({
            position: markerLocation,
            map: map,
            icon: image
        });
        markers.push(marker);

        var infowindow = new google.maps.InfoWindow({ content: '' });
        var html = [];
        html.push(
            '<img style="height:10px;width:10px" src="' + placemark.imageUrl + '"/> ' +
                placemark.title
        );
        if (placemark.marketValuation > 0) {
            html.push(
                'Website: <a href="' + placemark.websiteUrl + '">' + placemark.websiteUrl + '</a>'
            );
        }
        bindInfoWindow(
            marker,
            map,
            infowindow,
            html.join('<br/>'),
            placemark.title,
            placemark.websiteUrl
        );
    }
}

function bindInfoWindow(marker, map, infowindow, html, company, websiteUrl) {
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(html);
        infowindow.open(map, marker);
        ga('send', 'event', 'placemark', 'click', company);
        if (websiteUrl) {
            window.open(websiteUrl, '_blank');
        }
    });

    marker.addListener('mouseover', function () {
        infowindow.setContent(html);
        infowindow.open(map, this);
        ga('send', 'event', 'placemark', 'hover', company);
    });

    marker.addListener('mouseout', function () {
        infowindow.close();
    });
}

function rerender() {
    ga('send', 'event', 'toggle', 'toggle');
    renderMarkers();
    renderHeatMap();
}

function renderMarkers() {
    var showPublic = document.getElementById('publicCheckbox').checked;
    for (var i in markers) {
        var placemark = PLACEMARKS[i];
        var marker = markers[i];
        if (placemark.marketValuation > 0 && showPublic) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    }
}

function renderHeatMap() {
    if (heatmap) {
        heatmap.setMap(null);
        heatmap.getData().j = [];
    }

    var showPublic = document.getElementById('publicCheckbox').checked;
    var heatmapData = [];
    for (var i in PLACEMARKS) {
        var placemark = PLACEMARKS[i];
        if (placemark.latitude === null || placemark.longitude === null) continue;

        if (placemark.marketValuation > 0 && showPublic) {
            heatmapData.push({
                location: new google.maps.LatLng(
                    placemark.latitude,
                    placemark.longitude
                ),
                weight: 1
            });
        }
    }

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
    });
    heatmap.set('radius', 100);
    heatmap.set('opacity', 0.25);
}

function ChangeMarkers() {
    var showPublic = document.getElementById('publicCheckbox').checked;
    for (var i in markers) {
        var placemark = PLACEMARKS[i];
        var marker = markers[i];
        if (placemark.marketValuation > 0 && showPublic) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    }
}
