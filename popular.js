// ========== FAVORITES HELPERS ==========
function loadFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(fav) {
  localStorage.setItem("favorites", JSON.stringify(fav));
}

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  const favorites = loadFavorites();
  list.innerHTML = "";

  if (!favorites.length) {
    list.innerHTML = "<li>No favorites yet.</li>";
    return;
  }

  favorites.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // ===== NAV TOGGLE (only if you add a .nav__toggle button later) =====
  const toggleButton = document.querySelector('.nav__toggle');
  const navList = document.querySelector('.nav__list');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      navList.classList.toggle('nav__list--active');
    });
  }

  // ===== FAVORITES + SIDEBAR =====
  let favorites = loadFavorites();
  const hearts = document.querySelectorAll(".heart-btn");

  const sidebar = document.getElementById("favoritesSidebar");
  const openBtn = document.getElementById("openFavorites");
  const closeBtn = document.getElementById("closeFavorites");

  function openSidebar() {
    sidebar.classList.add("active");
  }

  function closeSidebar() {
    sidebar.classList.remove("active");
  }

  // Set up heart buttons
  hearts.forEach(btn => {
    const name = btn.dataset.name;

    // Mark already-saved favorites
    if (favorites.includes(name)) {
      btn.classList.add("favorited");
      btn.textContent = "❤️";
    }

    btn.addEventListener("click", (event) => {
      // Don't trigger the card click (flights) when tapping the heart
      event.stopPropagation();

      if (favorites.includes(name)) {
        favorites = favorites.filter(f => f !== name);
        btn.classList.remove("favorited");
        btn.textContent = "♡";
      } else {
        favorites.push(name);
        btn.classList.add("favorited");
        btn.textContent = "❤️";
      }

      saveFavorites(favorites);
      renderFavorites();
      openSidebar();
    });
  });

  openBtn.addEventListener("click", openSidebar);
  closeBtn.addEventListener("click", closeSidebar);

  renderFavorites();

  // ===== PRICELINE FLIGHTS API =====
  const destinationCards = document.querySelectorAll('.destination-card');
  const flightsResultsDiv = document.getElementById('flights-results');
  const flightsSection = document.getElementById('flights-section');

  function setFlightsLoading(isLoading) {
    if (isLoading) {
      flightsResultsDiv.innerHTML = '<p class="flights__loading">Loading nearby flights...</p>';
    }
  }

  async function getNearbyFlights(latitude, longitude) {
    const url = `https://priceline-com2.p.rapidapi.com/flights/nearby?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '376b925fa3mshb501d30579091a6p1f66a4jsna00db72d1ab7',
        'x-rapidapi-host': 'priceline-com2.p.rapidapi.com'
      }
    };

    const response = await fetch(url, options);
    const text = await response.text();
    console.log('Raw flights response:', text);

    if (!response.ok) {
      throw new Error(`Flights API error: ${response.status}`);
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn("Could not parse JSON, returning raw text");
      return text;
    }
  }

  function renderFlights(data, cityName) {
    flightsResultsDiv.innerHTML = "";

    const airport = data?.data?.airNearbyAirportsRsp?.nearbyAirPorts?.[0];

    if (!airport) {
      flightsResultsDiv.innerHTML =
        `<p class="flights__error">No airport information found for ${cityName}.</p>`;
      return;
    }

    const distance = airport.searchDistance.toFixed(1);
    const gmt = airport.gmtOffset >= 0 ? `GMT+${airport.gmtOffset}` : `GMT${airport.gmtOffset}`;

    const card = document.createElement("div");
    card.className = "flight-card";

    card.innerHTML = `
      <h3 class="flight-card__title">✈️ Nearby Airport for ${cityName}</h3>
      <div class="flight-card__body">
        <h4 class="flight-card__airport">${airport.itemName} (${airport.airportCode})</h4>
        <p><strong>Distance from City:</strong> ${distance} km</p>
        <p><strong>City:</strong> ${airport.cityName}</p>
        <p><strong>Country:</strong> ${airport.country}</p>
        <p><strong>Time Zone:</strong> ${gmt}</p>
        <p class="flight-card__coords">
          <strong>Coordinates:</strong><br>
          Latitude: ${airport.lat.toFixed(4)}°<br>
          Longitude: ${airport.lon.toFixed(4)}°
        </p>
      </div>
    `;

    flightsResultsDiv.appendChild(card);
  }

  async function handleDestinationClick(card) {
    const cityName = card.querySelector('.destination-card__name')?.textContent || 'this destination';
    const lat = card.getAttribute('data-lat');
    const lon = card.getAttribute('data-lon');

    if (!lat || !lon) {
      alert('This destination does not have coordinates set yet.');
      return;
    }

    setFlightsLoading(true);

    try {
      const flightsData = await getNearbyFlights(lat, lon);
      renderFlights(flightsData, cityName);
      flightsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      flightsResultsDiv.innerHTML =
        `<p class="flights__error">Sorry, we couldn't load flight information for ${cityName}. Please try again later.</p>`;
    }
  }

  destinationCards.forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => handleDestinationClick(card));
  });
});
