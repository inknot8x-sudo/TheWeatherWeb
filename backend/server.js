const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config(); // ← Cargar variables desde .env

const app = express();
app.use(cors());

const API_KEY = process.env.WEATHER_API_KEY;

app.get('/api/weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'Debes proporcionar una ciudad.' });
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&lang=es`
    );
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
      viento_kph: data.current.wind_kph
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos del clima' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
