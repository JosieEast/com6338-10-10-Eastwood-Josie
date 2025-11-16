const API_KEY = '68686ffff4d06133be2e692824b45274';
const form = document.querySelector("#search-form");
const input = document.querySelector("#city-input");
const resultContainer = document.querySelector("#result");
const recentList = document.querySelector("#recent");
const statusNote = document.querySelector("#status");
const clearBtn = document.querySelector("#clear-cache");
const toggleButton = document.querySelector('.nav__toggle');
const navList = document.querySelector('.nav__list');

toggleButton.addEventListener('click', () => {
  navList.classList.toggle('nav__list--active');
});

function getStoredCities() {
  return JSON.parse(localStorage.getItem("weatherSearches")) || [];
}

function storeCity(city) {
  let cities = getStoredCities();
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("weatherSearches", JSON.stringify(cities));
  }
}

function clearStoredCities() {
  localStorage.removeItem("weatherSearches");
  renderHistory();
}

function renderHistory() {
  const cities = getStoredCities();
  recentList.innerHTML = "";

  if (cities.length === 0) {
    recentList.innerHTML = "<li>No recent searches.</li>";
    return;
  }

  cities.forEach((city) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.className = "history-btn";
    btn.addEventListener("click", () => fetchWeather(city));
    li.appendChild(btn);
    recentList.appendChild(li);
  });
}

async function fetchWeather(city) {
  if (!city) return;

  resultContainer.innerHTML = "<p>Loading...</p>";

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=imperial`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    storeCity(data.name);
    renderHistory();

    resultContainer.innerHTML = `
      <div class="weather-card">
        <h2>${data.name}, ${data.sys.country}</h2>
        <p><strong>${data.weather[0].main}</strong> — ${data.weather[0].description}</p>
        <p>Temp: ${data.main.temp}°F</p>
        <p>Wind: ${data.wind.speed} mph</p>
        <p>Humidity: ${data.main.humidity}%</p>
      </div>
    `;
  } catch (err) {
    resultContainer.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  fetchWeather(city);
  input.value = "";
});

clearBtn.addEventListener("click", () => {
  clearStoredCities();
  resultContainer.innerHTML = "";
});

renderHistory();
