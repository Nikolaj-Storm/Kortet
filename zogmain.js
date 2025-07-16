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
	var mutedStyle = [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "administrative.locality", "elementType": "labels", "stylers": [{ "visibility": "on" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }, { "visibility": "simplified" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }, { "saturation": "-65" }, { "lightness": "45" }, { "gamma": "1.78" }] }, { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "on" }] }, { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.highway", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "saturation": "-33" }, { "lightness": "22" }, { "gamma": "2.08" }] }, { "featureType": "transit.station.airport", "elementType": "geometry", "stylers": [{ "gamma": "2.08" }, { "hue": "#ffa200" }] }, { "featureType": "transit.station.airport", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.station.rail", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.station.rail", "elementType": "labels.icon", "stylers": [{ "visibility": "simplified" }, { "saturation": "-55" }, { "lightness": "-2" }, { "gamma": "1.88" }, { "hue": "#ffab00" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#bbd9e5" }, { "visibility": "simplified" }] }];
	map.setOptions({ styles: mutedStyle });

	showMarkers(map);
	renderHeatMap();
}

function showMarkers(map) {
	for (var i in PLACEMARKS) {
	  var placemark = PLACEMARKS[i];
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
  
	  var infowindow = new google.maps.InfoWindow({
		content: ''
	  });
	  var html = [];
	  html.push('<img style="height:10px;width:10px" src="' + placemark.imageUrl + '"/> ' + placemark.title);
	  if (placemark.marketValuation > 0) {
		html.push('Website: <a href="' + placemark.websiteUrl + '">' + placemark.websiteUrl + '</a>');
	  }
	  // Temporarily comment out valuations until they're updated.
	  /*
	  if (placemark.startupValuation > 0) {
		html.push("Valuation: $" + placemark.startupValuation + "B");
	  }
	  */
	  bindInfoWindow(marker, map, infowindow, html.join("<br/>"), placemark.title, placemark.websiteUrl);
	}
  }
  

  function bindInfoWindow(marker, map, infowindow, html, company, websiteUrl) {
	google.maps.event.addListener(marker, 'click', function() {
	  infowindow.setContent(html);
	  infowindow.open(map, marker);
	  ga('send', 'event', 'placemark', 'click', company);
	  if (websiteUrl) {
		window.open(websiteUrl, '_blank');
	  }
	});
  
	marker.addListener('mouseover', function() {
	  infowindow.setContent(html);
	  infowindow.open(map, this);
	  ga('send', 'event', 'placemark', 'hover', company);
	});
  
	marker.addListener('mouseout', function() {
	  infowindow.setContent(html);
	  infowindow.close();
	});
  }
  
  

  function renderMarkers() {
	var showStartups = document.getElementById("startupsCheckbox").checked;
  
	for (var i in markers) {
	  var placemark = PLACEMARKS[i];
	  var marker = markers[i];
	  
	  if (placemark.Category === "Incubator" && showStartups) {
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

	var showLargePublic = document.getElementById("largePublicCheckbox").checked;
	var showPublic = document.getElementById("publicCheckbox").checked;

	var heatmapData = [];
	for (var i in markers) {
		var placemark = PLACEMARKS[i];
		var weight = Math.log(placemark.marketValuation * 10);
		if (showLargePublic && placemark.marketValuation >= 100) {
			heatmapData.push({
				location: new google.maps.LatLng(placemark.latitude, placemark.longitude),
				weight: weight
			});
		}
		if (showPublic && placemark.marketValuation >= 1) {
			heatmapData.push({
				location: new google.maps.LatLng(placemark.latitude, placemark.longitude),
				weight: weight
			});
		}
	}

	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData
	});
	heatmap.setMap(map);
	heatmap.set('radius', 100);
	heatmap.set('opacity', 0.25);
}