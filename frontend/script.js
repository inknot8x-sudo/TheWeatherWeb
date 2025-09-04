let vozActiva = true;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("weatherForm");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const city = document.getElementById("cityInput").value.trim();
    if (!city) return;

    resultDiv.classList.add("hidden");
    resultDiv.innerHTML = " Buscando el clima...";

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
        hablarClima(data);
        resultDiv.classList.remove("hidden");

        // Partículas según condición
        const tipo = detectarTipoClima(data.condicion.toLowerCase());
        cargarParticles(tipo);
      }

      reproducirSonido(data.condicion.toLowerCase());

    } catch (err) {
      resultDiv.innerHTML = `<p>Error de conexión con el servidor.</p>`;
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
    archivo = "sounds/lluvia.mp3";
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
    console.warn("Error de reproducción:", err);
  });
}

navigator.geolocation.getCurrentPosition(async (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  try {
    const response = await fetch(`http://localhost:3000/api/forecast?lat=${lat}&lon=${lon}`);
    const forecastData = await response.json();

    console.log("Pronóstico recibido:", forecastData);
    

  } catch (err) {
    console.error("Error al obtener pronóstico:", err);
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

          //  Definir hora actual ANTES de usarla
          const now = new Date();
          const currentHour = now.getHours();

          
          const currentHourData = data.forecast.forecastday[0].hour[currentHour];

          const climaActual = {
            ciudad: data.location.name,
            pais: data.location.country,
            temperatura: currentHourData.temp_c,
            condicion: currentHourData.condition.text,
            humedad: currentHourData.humidity,
            viento_kph: currentHourData.wind_kph
          };

          //  Voz solo si está activa
          if (vozActiva) {
            hablarClima(climaActual);
          }

          //  Gráfico de próximas horas
          const hoy = data.forecast.forecastday[0].hour;
          const siguientesHoras = hoy
            .filter(h => parseInt(h.time.split(" ")[1].split(":")[0]) >= currentHour)
            .slice(0, 6);

          mostrarGraficoHoras(siguientesHoras);

        } catch (err) {
          console.error("Error al obtener pronóstico:", err);
        }
      },
      (error) => {
        console.error("Error de geolocalización:", error);
      }
    );
  } else {
    console.warn("Geolocalización no disponible");
  }
});




function mostrarPronostico(data) {
  const hourlyContainer = document.getElementById("hourlyForecast");
  const dailyContainer = document.getElementById("dailyForecast");
  const forecastSection = document.getElementById("forecast");

  hourlyContainer.innerHTML = "";
  dailyContainer.innerHTML = "";

  const now = new Date(data.location.localtime);
  const currentHour = now.getHours();

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

  // PRONÓSTICO POR DÍAS
  data.forecast.forecastday.slice(1).forEach((day, index) => {
  const fecha = new Date(day.date).toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short"
  });

  const html = `
    <div class="forecast-item fancy-day">
      <p class="day-date">${fecha}</p>
      <img src="https:${day.day.condition.icon}" alt="icono clima" />
      <p class="temp">${day.day.avgtemp_c}°C</p>
      <p class="desc">${day.day.condition.text}</p>
      <canvas id="chart-${index}" data-day-index="${index + 1}" width="200" height="100"></canvas>
    </div>
  `;

  dailyContainer.innerHTML += html;

  const labels = day.hour.map(h => h.time.split(" ")[1].slice(0, 5));
  const temps = day.hour.map(h => h.temp_c);

  setTimeout(() => {
    const ctx = document.getElementById(`chart-${index}`).getContext("2d");
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '°C',
          data: temps,
          borderColor: '#fff',
          backgroundColor: 'rgba(255,255,255,0.1)',
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#fff', font: { size: 8 } }
          },
          y: {
            ticks: { color: '#fff', font: { size: 8 } }
          }
        }
      }
    });
  }, 100);
});


  forecastSection.classList.remove("hidden");

  window.forecastData = data;
}


let tempChart = null;

function mostrarGraficoHoras(horas) {
  const labels = horas.map(h => h.time.split(" ")[1].slice(0, 5)); 
  const temperaturas = horas.map(h => h.temp_c);

  const ctx = document.getElementById('tempChart').getContext('2d');

  if (tempChart) {
    tempChart.destroy();
  }

  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperatura (°C)',
        data: temperaturas,
        borderColor: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#fff' }
        },
        y: {
          ticks: { color: '#fff' }
        }
      }
    }
  });
}


let fullChart = null;

document.addEventListener("click", function (e) {
  if (e.target.tagName === "CANVAS" && e.target.dataset.dayIndex !== undefined) {
    const dayIndex = parseInt(e.target.dataset.dayIndex);
    const forecast = window.forecastData.forecast.forecastday[dayIndex];

    abrirGraficoAmpliado(forecast);
  }
});

function abrirGraficoAmpliado(dayData) {
  const modal = document.getElementById("chartModal");
  const ctx = document.getElementById("fullChart").getContext("2d");

  const labels = dayData.hour.map(h => h.time.split(" ")[1].slice(0, 5));
  const temps = dayData.hour.map(h => h.temp_c);

  if (fullChart) {
    fullChart.destroy();
  }

  fullChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Temperatura (${dayData.date})`,
        data: temps,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.2)',
        pointBackgroundColor: '#fff',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#fff' }
        },
        y: {
          ticks: { color: '#fff' }
        }
      }
    }
  });

  modal.classList.remove("hidden");
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("chartModal").classList.add("hidden");
});


function hablarClima(data) {
  if (!vozActiva || !window.speechSynthesis) return;

  const texto = `El clima en ${data.ciudad}, ${data.pais} es ${data.condicion}. 
  La temperatura es de ${data.temperatura} grados Celsius. 
  La humedad es del ${data.humedad} por ciento 
  y el viento sopla a ${data.viento_kph} kilómetros por hora.`;

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "es-ES";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

const toggleBtn = document.getElementById("toggleVoiceBtn");

toggleBtn.addEventListener("click", () => {
  vozActiva = !vozActiva;

  if (!vozActiva) {
    window.speechSynthesis.cancel(); 
    toggleBtn.textContent = "🔇 Voz desactivada";
  } else {
    toggleBtn.textContent = "🔊 Voz activada";
  }
});

document.body.addEventListener("click", () => {
  if (!vozActiva || window.speechSynthesis.speaking) return;

  hablarClima(ultimoClimaDetectado); 
}, { once: true });
