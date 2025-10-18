let map, service, infoWindow, autocomplete;
let userLocation = null;
const markers = [];

function initMap() {
  const defaultCenter = { lat: 39.0, lng: -98.0 }; // USA center

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 4,
  });

  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);

  const input = document.getElementById("place");
  const searchBtn = document.getElementById("searchBtn");

  // Enable autocomplete
  autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["geometry", "name"],
    types: ["establishment", "geocode"],
  });
  autocomplete.bindTo("bounds", map);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      alert("search.");
      return;
    }
    map.setCenter(place.geometry.location);
    map.setZoom(13);
    doSearch(place.name);
  });

  // Button and Enter key search
  searchBtn.addEventListener("click", () => doSearch(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch(input.value);
    }
  });

  // Try to get user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        map.setCenter(userLocation);
        map.setZoom(13);
        new google.maps.Marker({
          position: userLocation,
          map,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#0b5cff",
            fillOpacity: 1,
            strokeWeight: 2,
          },
        });
      },
      () => console.warn("Geolocation permission denied or unavailable.")
    );
  } else {
    console.warn("Geolocation not supported by this browser.");
  }
}

function clearMarkers() {
  markers.forEach((m) => m.setMap(null));
  markers.length = 0;
}

function doSearch(query) {
  const q = query.trim();
  if (!q) {
    alert("Please enter a place to search.");
    return;
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (userLocation) {
    const nearbyRequest = {
      location: userLocation,
      radius: 5000, // 5 km range
      keyword: q,
    };
    service.nearbySearch(nearbyRequest, (results, status) => {
      handleResults(results, status);
    });
  } else {
    const request = {
      query: q,
      fields: ["name", "geometry", "formatted_address", "place_id"],
    };
    service.textSearch(request, (results, status) => {
      handleResults(results, status);
    });
  }
}

function handleResults(results, status) {
  if (
    status !== google.maps.places.PlacesServiceStatus.OK ||
    !results ||
    !results.length
  ) {
    alert("No results found or API issue occurred.");
    return;
  }

  clearMarkers();
  const topResults = results.slice(0, 5);
  const resultsDiv = document.getElementById("results");

  topResults.forEach((place, index) => {
    const marker = new google.maps.Marker({
      map,
      position: place.geometry.location,
      title: place.name,
      animation: google.maps.Animation.DROP,
    });
    markers.push(marker);

    const card = document.createElement("button");
    card.className = "place-card";
    card.innerHTML = `<strong>${index + 1}. ${place.name}</strong><br><small>${place.vicinity || place.formatted_address || ""}</small>`;
    resultsDiv.appendChild(card);

    const showPlace = () => {
      map.panTo(marker.getPosition());
      map.setZoom(15);
      infoWindow.setContent(`<b>${place.name}</b><br>${place.vicinity || place.formatted_address || ""}`);
      infoWindow.open(map, marker);
    };

    marker.addListener("click", showPlace);
    card.addEventListener("click", showPlace);
  });

  if (markers[0]) google.maps.event.trigger(markers[0], "click");
}
