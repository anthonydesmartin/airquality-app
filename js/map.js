let airQualityLayer = L.layerGroup();
let meteoLayer = L.layerGroup();

async function airQuality(city, layer) {
  await fetch(
    `http://api.waqi.info/feed/${city}/?token={api-key}`
  )
    .catch((error) => {
      console.error("Une erreur est survenue", error);
    })
    .then((response) => response.json())
    .then((response) => {
      let data = response.data;
      let city = data.city;
      let color;
      if (data.aqi >= 0 && data.aqi <= 50) {
        color = "green";
      }
      if (data.aqi >= 51 && data.aqi <= 100) {
        color = "yellow";
      }
      if (data.aqi >= 101 && data.aqi <= 150) {
        color = "orange";
      }
      if (data.aqi >= 151 && data.aqi <= 200) {
        color = "red";
      }
      if (data.aqi >= 201 && data.aqi <= 300) {
        color = "purple";
      }
      if (data.aqi >= 301) {
        color = "#6e0b14";
      }

      let iaqi = data.iaqi;
      let circle = L.circle([city.geo[0], city.geo[1]], {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 20000,
      });

      let popup = L.popup().setContent(`
        <h3>Taux de polluants</h3>
        <ul>
            <li>PM2.5: ${iaqi.pm25 === undefined ? "0" : iaqi.pm25.v}</li>
            <li>PM10: ${iaqi.pm10 === undefined ? "0" : iaqi.pm10.v}</li>
            <li>O3: ${iaqi.o3 === undefined ? "0" : iaqi.o3.v}</li>
            <li>NO2: ${iaqi.no2 === undefined ? "0" : iaqi.no2.v}</li>
            <li>SO2: ${iaqi.so2 === undefined ? "0" : iaqi.so2.v}</li>
            <li>CO: ${iaqi.co === undefined ? "0" : iaqi.co.v}</li>
        </ul>
        `);
      circle.bindPopup(popup);
      circle.addTo(layer);
    });
}

async function meteo(insee, layer) {
  await fetch(
    `https://api.meteo-concept.com/api/forecast/daily?token={api-key}&insee=${insee}`
  )
    .catch((error) => {
      console.error("Une erreur est survenue", error);
    })
    .then((response) => response.json())
    .then((response) => {
      let data = response.forecast[0].weather;
      let longitude = response.forecast[0].longitude;
      let latitude = response.forecast[0].latitude;
      let icon_name = "";

      if (data >= 0 && data <= 2) {
        icon_name = "wi-day-sunny";
      }
      if (data >= 6 && data <= 7) {
        icon_name = "wi-day-fog";
      }
      if (data >= 3 && data <= 5) {
        icon_name = "wi-day-cloudy";
      }
      if ((data >= 20 && data <= 220) || (data >= 20 && data <= 222)) {
        icon_name = "wi-day-snow";
      }
      if ((data >= 40 && data <= 48) || (data >= 10 && data <= 15)) {
        icon_name = "wi-day-rain";
      }
      if (data >= 100 && data <= 138) {
        icon_name = "wi-day-thunderstorm";
      }
      let path = `../assets/${icon_name}.svg`;

      let wheather_icon = L.icon({
        iconUrl: path,
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76],
      });

      let icon = L.marker([latitude, longitude], { icon: wheather_icon });
      icon.addTo(layer);
    });
}

async function getVille(choice) {
  return fetch(
    `https://geo.api.gouv.fr/communes?nom=${choice}&fields=nom,code&format=json&geometry=centre`
  )
    .then((response) => response.json())
    .then((response) => response.find((ville) => choice === ville.nom).code)
    .catch((error) => {
      console.error("Une erreur est survenue", error);
    });
}

let map = L.map("map", {
  center: [46.631, 2.42],
  zoom: 7,
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let layerControl = L.control.layers().addTo(map);
layerControl.addBaseLayer(airQualityLayer, "Qualité de l'air");
layerControl.addBaseLayer(meteoLayer, "Météo");

let cities = {
  Paris: "75056",
  Marseille: "13055",
  Lyon: "69123",
  Toulouse: "31555",
  Nice: "06088",
  Nantes: "44109",
  Montpellier: "34172",
  Strasbourg: "67482",
  Bordeaux: "33063",
  Lille: "59350",
};
let tab = Object.entries(cities);

tab.forEach((element) => {
  meteo(element[1], meteoLayer);
  airQuality(element[0], airQualityLayer);
});

const input = document.querySelector("#field");
const submit = document.querySelector("#submit");
const error = document.querySelector("#error");

submit.addEventListener("click", async () => {
  let choice = input.value;
  if (input.value !== "") {
    let code = await getVille(choice);
    airQuality(choice, airQualityLayer);
    meteo(code, meteoLayer);
    input.value = "";
  } else {
    error.innerHTML = "le champs est vide";
    setTimeout(() => {
      error.innerHTML = "";
    }, "2000");
  }
});
