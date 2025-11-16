// ---- Unsplash API image search ----

const UNSPLASH_ACCESS_KEY = "grlhFCXf2yuNuH0zRALAy7hwIh8K95wl3t-m-BRSy98";

const searchForm = document.getElementById("destination-search");
const searchInput = document.getElementById("search-input");
const searchResult = document.getElementById("search-result");
const searchError = document.getElementById("search-error");

if (searchForm && searchInput && searchResult && searchError) {
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const destination = searchInput.value.trim();

    // Clear previous messages
    searchError.textContent = "";
    searchResult.innerHTML = "";

    if (!destination) {
      searchError.textContent = "Please enter a destination to search for an image.";
      return;
    }

    // Build Unsplash search URL
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      destination
    )}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Problem fetching image");
      }

      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        searchError.textContent = `No images found for "${destination}". Try another place.`;
        return;
      }

      const photo = data.results[0];

      // Create image element
      const img = document.createElement("img");
      img.src = photo.urls.regular;
      img.alt = photo.alt_description || `Photo of ${destination}`;
      img.style.width = "100%";
      img.style.maxWidth = "600px";
      img.style.borderRadius = "12px";
      img.style.marginTop = "1rem";

      searchResult.appendChild(img);

      // (Optional) Save last search in localStorage
      localStorage.setItem(
        "lastDestinationImage",
        JSON.stringify({
          destination,
          imageUrl: photo.urls.small
        })
      );
    } catch (error) {
      console.error(error);
      searchError.textContent =
        "Something went wrong while loading the image. Please try again.";
    }
  });
}
