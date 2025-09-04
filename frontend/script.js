document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("weatherForm");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const city = document.getElementById("cityInput").value.trim();
    if (!city) return;

    resultDiv.classList.add("hidden");
    resultDiv.innerHTML = "⏳ Buscando el clima...";

    try {
      const response = await fetch(`http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();

      if (data.error) {
        resultDiv.innerHTML = `<p>❌ ${data.error}</p>`;
      } else {
        // Día/Noche
        document.body.classList.toggle("day", data.es_dia);
        document.body.classList.toggle("night", !data.es_dia);

        // Mostrar resultado
        resultDiv.innerHTML = `
          <h2>${data.ciudad}, ${data.pais}</h2>
          <img src="https:${data.icono}" alt="icono del clima">
          <p>🌡️ ${data.temperatura}°C</p>
          <p>☁️ ${data.condicion}</p>
          <p>💧 Humedad: ${data.humedad}%</p>
          <p>💨 Viento: ${data.viento_kph} km/h</p>
        `;
        resultDiv.classList.remove("hidden");

        // Partículas según condición
        const tipo = detectarTipoClima(data.condicion.toLowerCase());
        cargarParticles(tipo);
      }

      reproducirSonido(data.condicion.toLowerCase());

    } catch (err) {
      resultDiv.innerHTML = `<p>⚠️ Error de conexión con el servidor.</p>`;
      resultDiv.classList.remove("hidden");
      console.error(err);
    }
  });
});

function detectarTipoClima(condicion) {
  if (condicion.includes("lluvia") || condicion.includes("rain")) return "lluvia";
  if (condicion.includes("nieve") || condicion.includes("snow")) return "nieve";
  if (condicion.includes("sol") || condicion.includes("clear") || condicion.includes("soleado")) return "sol";
  if (condicion.includes("niebla") || condicion.includes("fog") || condicion.includes("bruma")) return "niebla";
  return "nublado";
}

function cargarParticles(tipo) {
  let opciones = {};

  if (tipo === "lluvia") {
    opciones = {
      particles: {
        number: { value: 150 },
        color: { value: "#9ecfff" },
        shape: { type: "circle" },
        opacity: { value: 2 },
        size: { value: 3 },
        move: {
          enable: true,
          direction: "bottom",
          speed: 10,
          straight: true
        }
      }
    };
  } else if (tipo === "nieve") {
    opciones = {
      particles: {
        number: { value: 100 },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 2 },
        size: { value: 4 },
        move: {
          enable: true,
          direction: "bottom",
          speed: 1,
          random: true,
          straight: false
        }
      }
    };
  } else if (tipo === "sol") {
    opciones = {
      particles: {
        number: { value: 30 },
        shape: {
          type: "character",
          character: {
            value: "☀️",
            font: "Verdana",
            style: "",
            weight: "400"
          }
        },
        size: { value: 18 },
        opacity: { value: 0.7 },
        move: {
          enable: true,
          direction: "top-right",
          speed: 1,
          random: true
        },
        color: { value: "#fdd835" }
      }
    };
  } else if (tipo === "niebla") {
    opciones = {
      particles: {
        number: { value: 80 },
        color: { value: "#dddddd" },
        shape: { type: "circle" },
        opacity: { value: 0.30 },
        size: { value: 6 },
        move: {
          enable: true,
          direction: "top",
          speed: 0.5,
          random: true
        }
      }
    };
  } else {
    opciones = {
      particles: {
        number: { value: 60 },
        color: { value: "#cfcfcf" },
        shape: { type: "circle" },
        opacity: { value: 0.4 },
        size: { value: 3 },
        move: {
          enable: true,
          direction: "top",
          speed: 0.5,
          random: true
        }
      }
    };
  }

  tsParticles.dom().forEach(instance => instance.destroy());

  tsParticles.load("particles-container", {
    fullScreen: false,
    background: { color: "transparent" },
    ...opciones
  });
}

let currentAudio = null;

function reproducirSonido(clima) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  let archivo = "";

  if (clima.includes("lluvia") || clima.includes("rain")) {
    archivo = "sounds/lluvia.m4a";
  } else if (clima.includes("nieve") || clima.includes("snow")) {
    archivo = "sounds/nieve.m4a";
  } else if (clima.includes("soleado") || clima.includes("sun") || clima.includes("despejado")) {
    archivo = "sounds/sol.mp3";
  } else {
    archivo = "sounds/nublado.mp3";
  }

  currentAudio = new Audio(archivo);
  currentAudio.loop = true;
  currentAudio.volume = 0.4;

  currentAudio.play().catch(err => {
    console.warn("🎧 Error de reproducción:", err);
  });
}

navigator.geolocation.getCurrentPosition(async (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  try {
    const response = await fetch(`http://localhost:3000/api/forecast?lat=${lat}&lon=${lon}`);
    const forecastData = await response.json();

    console.log("🌤️ Pronóstico recibido:", forecastData);
    // aquí haces lo que quieras con forecastData.forecast.forecastday

  } catch (err) {
    console.error("❌ Error al obtener pronóstico:", err);
  }
});


window.addEventListener("DOMContentLoaded", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
          const data = await res.json();

          mostrarPronostico(data);
        } catch (err) {
          console.error("❌ Error al obtener pronóstico:", err);
        }
      },
      (error) => {
        console.error("⛔ Error de geolocalización:", error);
      }
    );
  } else {
    console.warn("⚠️ Geolocalización no disponible");
  }
});

function mostrarPronostico(data) {
  const hourlyContainer = document.getElementById("hourlyForecast");
  const dailyContainer = document.getElementById("dailyForecast");
  const forecastSection = document.getElementById("forecast");

  hourlyContainer.innerHTML = "";
  dailyContainer.innerHTML = "";

  // 🕒 Obtener hora actual en la ciudad
  const now = new Date(data.location.localtime);
  const currentHour = now.getHours();

  // 🔄 PRONÓSTICO POR HORAS (las próximas 6 horas desde la hora actual)
  const todayHours = data.forecast.forecastday[0].hour;
  const hoursToShow = todayHours.slice(currentHour, currentHour + 6);

  hoursToShow.forEach(hour => {
    const hora = new Date(hour.time).toLocaleTimeString("es-ES", {
      hour: "2-digit", minute: "2-digit"
    });

    const html = `
      <div class="forecast-item fancy-hour">
        <p class="hour-time">${hora}</p>
        <img src="https:${hour.condition.icon}" alt="icono clima" />
        <p class="temp">${hour.temp_c}°C</p>
        <p class="desc">${hour.condition.text}</p>
      </div>
    `;
    hourlyContainer.innerHTML += html;
  });

  // 📅 PRONÓSTICO POR DÍAS
  data.forecast.forecastday.forEach(day => {
    const fecha = new Date(day.date).toLocaleDateString("es-ES", {
      weekday: "short", day: "numeric", month: "short"
    });

    const html = `
      <div class="forecast-item fancy-day">
        <p class="day-date">${fecha}</p>
        <img src="https:${day.day.condition.icon}" alt="icono clima" />
        <p class="temp">${day.day.avgtemp_c}°C</p>
        <p class="desc">${day.day.condition.text}</p>
      </div>
    `;
    dailyContainer.innerHTML += html;
  });

  forecastSection.classList.remove("hidden");
}

