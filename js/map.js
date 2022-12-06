let circles = [];

async function airQuality(city) {
  await fetch(
      `http://api.waqi.info/feed/${city}/?token=2bb11996a4fc2eea9c6b546e5b144a05e532de11`).
      then(response => response.json()).
      then(response => {
        let data = response.data;
        let city = data.city;
        let color;
        if (data.aqi >= 0 && data.aqi <= 50) {
          color = 'green';
        }
        if (data.aqi >= 51 && data.aqi <= 100) {
          color = 'yellow';
        }
        if (data.aqi >= 101 && data.aqi <= 150) {
          color = 'orange';
        }
        if (data.aqi >= 151 && data.aqi <= 200) {
          color = 'red';
        }
        if (data.aqi >= 201 && data.aqi <= 300) {
          color = 'purple';
        }
        if (data.aqi >= 301) {
          color = '#6e0b14';
        }

        console.log(data);
        let iaqi = data.iaqi;
        let circle = L.circle([city.geo[0], city.geo[1]], {
          color: color,
          fillColor: color,
          fillOpacity: 0.5,
          radius: 20000,
        }).addTo(map);

        let popup = L.popup().setContent(`
        <h3>Taux de polluants</h3>
        <ul>
            <li>PM2.5: ${iaqi.pm25.v}</li>
            <li>PM10: ${iaqi.pm10.v}</li>
            <li>O3: ${iaqi.o3.v}</li>
            <li>NO2: ${iaqi.no2.v}</li>
            <li>SO2: ${iaqi.so2 == undefined ? '0' : iaqi.so2.v}</li>
            <li>CO: ${iaqi.co == undefined ? '0' : iaqi.co.v}</li>
        </ul>
        `);
        circle.bindPopup(popup);
        circles.push(circle);
      });
}



async function meteo(city) {
  await fetch(
      `https://api.meteo-concept.com/api/climatology/day/around/35238?token=11c99439bb548a3b435ac2320f755456c9dd1909365419cf6b4e9689f39b6e6a`).
      then(response => console.log(response.json()))
      // then(response => {
      //   let data = response.data;
      //   let city = data.city;
      //   let color;
      //   if (data.aqi >= 0 && data.aqi <= 50) {
      //     color = 'green';
      //   }
      //   if (data.aqi >= 51 && data.aqi <= 100) {
      //     color = 'yellow';
      //   }
      //   if (data.aqi >= 101 && data.aqi <= 150) {
      //     color = 'orange';
      //   }
      //   if (data.aqi >= 151 && data.aqi <= 200) {
      //     color = 'red';
      //   }
      //   if (data.aqi >= 201 && data.aqi <= 300) {
      //     color = 'purple';
      //   }
      //   if (data.aqi >= 301) {
      //     color = '#6e0b14';
      //   }
      //
      //   console.log(data);
      //   let iaqi = data.iaqi;
      //   let circle = L.circle([city.geo[0], city.geo[1]], {
      //     color: color,
      //     fillColor: color,
      //     fillOpacity: 0.5,
      //     radius: 20000,
      //   }).addTo(map);
      //
      //   let popup = L.popup().setContent(`
      //   <h3>Taux de polluants</h3>
      //   <ul>
      //       <li>PM2.5: ${iaqi.pm25.v}</li>
      //       <li>PM10: ${iaqi.pm10.v}</li>
      //       <li>O3: ${iaqi.o3.v}</li>
      //       <li>NO2: ${iaqi.no2.v}</li>
      //       <li>SO2: ${iaqi.so2 == undefined ? '0' : iaqi.so2.v}</li>
      //       <li>CO: ${iaqi.co == undefined ? '0' : iaqi.co.v}</li>
      //   </ul>
      //   `);
      //   circle.bindPopup(popup);
      //   circles.push(circle);
      // });
}

let airQualityLayer = L.layerGroup(circles);

let map = L.map('map', {
  center: [46.631, 2.42],
  zoom: 7,
  layers: airQualityLayer,
});

let overlayMaps = {
  "Qualité de l'air": airQualityLayer
}

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let layerControl = L.control.layers(overlayMaps).addTo(map);

let city = [
  'Paris',
  'Marseille',
  'Lyon',
  'Toulouse',
  'Nice',
  'Nantes',
  'Montpellier',
  'Strasbourg',
  'Bordeaux',
  'Lille'];

let apiData = [];

city.forEach(element => {
  meteo(element);
  // airQuality(element);
});

console.log(circles)