const cityInput = document.getElementById("city");
const plzInput = document.getElementById("postalCode");
const suggestionsDiv = document.getElementById("suggestion");
const longitudeInput = document.getElementById("longitude");
const latitudeInput = document.getElementById("latitude");

const apiUrl = "http://wifi.1av.at/getplz.php?json";
let locationsData = [];

const getApiData = async () => {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    locationsData = plzOrt(data);
  } catch (error) {
    console.error("Error fetching API data", error);
  }
};

const plzOrt = (data) => {
  return Object.entries(data).flatMap(([plz, cities]) =>
    cities.map((city) => ({ ort: city, plz }))
  );
};

const updateSuggestions = (query) => {
  suggestionsDiv.innerHTML = "";
  if (query.length < 2) return;

  const filteredOrts = locationsData.filter((item) =>
    item.ort.toLowerCase().includes(query)
  );

  filteredOrts.forEach(({ ort, plz }) => {
    const option = document.createElement("div");
    option.classList.add("suggestion-item");
    option.textContent = `${ort} (${plz})`;
    option.addEventListener("click", () => {
      cityInput.value = ort;
      plzInput.value = plz;
      getCoordinatesData(ort, plz);
      suggestionsDiv.innerHTML = "";
    });
    suggestionsDiv.appendChild(option);
  });
};

cityInput.addEventListener("keyup", (event) => {
  updateSuggestions(event.target.value.toLowerCase());
});

async function getCoordinatesData(ort, plz) {
  try {
    const response = await fetch(`https://api.zippopotam.us/AT/${plz}`);
    if (!response.ok) throw new Error("Failed to fetch coordinates");

    const data = await response.json();
    console.log("API Response:", data);

    if (!data.places || data.places.length === 0) {
      throw new Error("No places found for this postal code");
    }

    const place = data.places.find(
      (p) => ort.toLowerCase() === p["place name"].toLowerCase()
    );

    if (!place) {
      console.warn("City name does not match API response.");
      longitudeInput.value = data.places[0].longitude;
      latitudeInput.value = data.places[0].latitude;
    } else {
      longitudeInput.value = place.longitude;
      latitudeInput.value = place.latitude;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
  }
}
// Fetch API data
getApiData();
