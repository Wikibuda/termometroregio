export default async function handler(req, res) {
  // Configuración completa de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  
  // Manejo de solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    // Verifica que la API key exista
    if (!API_KEY) {
      console.error('ERROR: API_KEY no configurada');
      return res.status(500).json({
        error: 'Configuración incompleta',
        details: 'API key no configurada en variables de entorno',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verifica que la API key tenga 32 caracteres
    if (API_KEY.length !== 32) {
      console.error('ERROR: API_KEY longitud incorrecta', API_KEY.length);
      return res.status(500).json({
        error: 'Configuración incorrecta',
        details: 'La API key debe tener 32 caracteres',
        timestamp: new Date().toISOString()
      });
    }
    
    const CITY = 'Monterrey';
    const COUNTRY_CODE = 'MX';
    
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${API_KEY}&units=metric&lang=es`;
    console.log('URL de la API:', apiUrl.replace(API_KEY, '***REDACTED***'));
    
    const response = await fetch(apiUrl);
    
    // Manejo seguro de errores de la API
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch (e) {
        try {
          errorBody = { message: await response.text() };
        } catch (e2) {
          errorBody = { message: 'Error desconocido al obtener datos climáticos' };
        }
      }
      
      console.error('Error de la API:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      
      // Maneja específicamente el error 401
      if (response.status === 401) {
        return res.status(401).json({
          error: 'API key inválida',
          details: 'Verifica tu API key en OpenWeatherMap',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(response.status).json({
        error: 'Error de la API',
        details: errorBody.message || response.statusText,
        timestamp: new Date().toISOString()
      });
    }
    
    // Parsea la respuesta como JSON
    const data = await response.json();
    
    // Procesa los datos
    const processedData = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      weatherId: data.weather[0].id,
      timestamp: new Date().toISOString()
    };
    
    // Devuelve la respuesta
    res.status(200).json(processedData);
    
  } catch (error) {
    console.error('Error FATAL en la función:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}