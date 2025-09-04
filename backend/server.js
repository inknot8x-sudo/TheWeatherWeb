const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ✅ 1. Primero definimos las rutas de API
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;
  const API_KEY = process.env.WEATHER_API_KEY;

  if (!city) return res.status(400).json({ error: "Ciudad requerida" });

  try {
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&lang=es`);
    const data = await response.json();

    if (data.error) {
      return res.status(404).json({ error: data.error.message });
    }

    res.json({
      ciudad: data.location.name,
      pais: data.location.country,
      temperatura: data.current.temp_c,
      condicion: data.current.condition.text,
      icono: data.current.condition.icon,
      humedad: data.current.humidity,
      viento_kph: data.current.wind_kph,
      es_dia: data.current.is_day === 1
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener datos del clima" });
  }
});

app.get('/api/forecast', async (req, res) => {
  const { lat, lon } = req.query;
  const API_KEY = process.env.WEATHER_API_KEY;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Faltan coordenadas' });
  }

  try {
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=3&lang=es`);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener pronóstico:", err);
    res.status(500).json({ error: 'Error al obtener datos del pronóstico' });
  }
});

// ✅ 2. Después sirves los archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "../public")));

// ✅ 3. Finalmente lanzas el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
