let weatherAPIKey = "ca899a14f705fa4d8cbbefeacddfab55";
let weatherBaseEndPoint =
  "https://api.openweathermap.org/data/2.5/weather?appid=" +
  weatherAPIKey +
  "&units=metric";
let forecastEndPoint =
  "https://api.openweathermap.org/data/2.5/forecast?appid=" +
  weatherAPIKey +
  "&units=metric";
let geocodingBaseEndPoint =
  "http://api.openweathermap.org/geo/1.0/direct?limit=5&appid=" +
  weatherAPIKey +
  "&q=";
let currentCityEndPoint =
  "http://api.openweathermap.org/geo/1.0/reverse?limit=1&appid=" +
  weatherAPIKey;
let searchInp = document.querySelector(".weather_search");
let city = document.querySelector(".weather_city");
let day = document.querySelector(".weather_day");
let humidity = document.querySelector(".weather_indicator--humidity>.value");
let wind = document.querySelector(".weather_indicator--wind>.value");
let pressure = document.querySelector(".weather_indicator--pressure>.value");
let temperature = document.querySelector(".weather_temperature>.value");
let image = document.querySelector(".weather_image");
let forecastBlock = document.querySelector(".weather_forecast");
let weatherimage = document.querySelector(".weather_image");
let datalistcomponent = document.getElementById("suggestions");
let weatherImages = [
  {
    url: "images/broken-clouds.png",
    ids: [803, 804],
  },
  {
    url: "images/clear-sky.png",
    ids: [800],
  },
  {
    url: "images/few-clouds.png",
    ids: [801],
  },
  {
    url: "images/mist.png",
    ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
  },
  {
    url: "images/rain.png",
    ids: [500, 501, 502, 503, 504],
  },
  {
    url: "images/scattered-clouds.png",
    ids: [802],
  },
  {
    url: "images/shower-rain.png",
    ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321],
  },
  {
    url: "images/snow.png",
    ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
  },
  {
    url: "images/thunderstorm.png",
    ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
  },
];

let currentcity = "";
let options = { enableHighFrequency: true, timeout: 5000, maximumAge: 10000 };
window.onload = () => {
  navigator.geolocation.getCurrentPosition(
    getCurrentLocation,
    () => {
      Swal.fire({
        icon: "error",
        title: "Oops....",
        text: "Cannot get your current location! Please give location permission",
      });
    },
    options
  );
};

let getCurrentLocation = async (position) => {
  const { latitude, longitude } = position.coords;
  let endPoint = currentCityEndPoint + "&lat=" + latitude + "&lon=" + longitude;
  let response = await fetch(endPoint);
  response = await response.json();
  weatherForCity(response[0].name);
};

let getWeatherByCityName = async (city) => {
  let endPoint = weatherBaseEndPoint + "&q=" + city;
  let response = await fetch(endPoint);
  let weather = await response.json();
  return weather;
};

let getForecastByCityId = async (id) => {
  let endPoint = forecastEndPoint + "&id=" + id;
  let response = await fetch(endPoint);
  let forecast = await response.json();
  let forecastList = forecast.list;
  let daily = [];
  forecastList.forEach((weather) => {
    let date_txt = weather.dt_txt;
    date_txt = date_txt.replace(" ", "T");
    let date = new Date(date_txt);
    let hours = date.getHours();
    if (hours === 12) {
      daily.push(weather);
    }
  });
  return daily;
};

let updateCurrentWeather = (data) => {
  city.innerText = data.name;
  day.innerText = dayOfWeek();
  humidity.innerText = data.main.humidity;
  pressure.innerText = data.main.pressure;
  let windDirection;
  let deg = data.wind.deg;
  if (deg > 45 && deg <= 135) {
    windDirection = "East";
  } else if (deg > 135 && deg <= 225) {
    windDirection = "South";
  } else if (deg > 225 && deg <= 315) {
    windDirection = "West";
  } else {
    windDirection = "North";
  }
  wind.innerText = windDirection + ", " + data.wind.speed;
  temperature.innerText =
    data.main.temp > 0
      ? "+" + Math.round(data.main.temp)
      : Math.round(data.main.temp);
  let imgId = data.weather[0].id;
  weatherImages.forEach((obj) => {
    if (obj.ids.indexOf(imgId) !== -1) {
      weatherimage.src = obj.url;
    }
  });
};

let dayOfWeek = (date = new Date()) => {
  let today = date.toLocaleDateString("en-EN", { weekday: "long" });
  return today;
};

let weatherForCity = async (city) => {
  let weather = await getWeatherByCityName(city);
  if (weather.cod === "404") {
    Swal.fire({
      icon: "error",
      title: "Oops....",
      text: "You typed wrong city name",
    });
    return;
  }
  updateCurrentWeather(weather);
  let daily = await getForecastByCityId(weather.id);
  updateForcast(daily);
};

searchInp.addEventListener("keydown", async (e) => {
  if (e.keyCode === 13) {
    weatherForCity(searchInp.value);
  }
});
searchInp.addEventListener("input", async (e) => {
  if (searchInp.value.length <= 2) {
    return;
  }
  let endPoint = geocodingBaseEndPoint + searchInp.value;
  let result = await fetch(endPoint);
  result = await result.json();
  let datalist = "";
  result.forEach((city) => {
    datalist += `<option value="${city.name}${
      city.state ? "," + city.state : ""
    },${city.country}">`;
  });
  datalistcomponent.innerHTML = datalist;
});

let updateForcast = (forecast) => {
  forecastBlock.innerHTML = "";
  let forecastItem = "";
  forecast.forEach((day) => {
    let iconurl =
      "http://openweathermap.org/img/wn/" + day.weather[0].icon + "@2x.png";
    let temperature =
      day.main.temp > 0
        ? "+" + Math.round(day.main.temp)
        : Math.round(day.main.temp);
    let date_txt = day.dt_txt;
    date_txt = date_txt.replace(" ", "T");
    let date = new Date(date_txt);
    let weekday = dayOfWeek(date);
    forecastItem += `<div class="col-md-2 col-sm-9">
          <div class="card text-center weather_forecast_item">
            <img
              src=${iconurl}
              alt="${day.weather[0].description}"
              class="weather_forecast_icon card-img-top"
            />
            <div class="card-body">
              <h3 class="weather_forecast_day">${weekday}</h3>
              <p class="weather_forecast_temperature">
                <span class="value">${temperature}</span> &deg;C
              </p>
            </div>
          </div>
        </div>`;
  });
  forecastBlock.innerHTML = forecastItem;
};
