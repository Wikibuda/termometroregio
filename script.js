document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM - VERIFICAMOS QUE EXISTAN ANTES DE USARLOS
  const temperatureEl = document.getElementById('mm-temperature');
  const humidityEl = document.getElementById('mm-humidity');
  const windEl = document.getElementById('mm-wind');
  const weatherIconEl = document.getElementById('mm-weather-icon');
  const lastUpdatedEl = document.getElementById('mm-last-updated');
  const levelValueEl = document.getElementById('mm-level-value');
  const levelDescriptionEl = document.getElementById('mm-level-description');
  
  // Elementos de recomendaciones
  const recInoculanteEl = document.getElementById('mm-rec-inoculante');
  const recInoculanteDescEl = document.getElementById('mm-rec-inoculante-desc');
  const recAguaEl = document.getElementById('mm-rec-agua');
  const recAguaDescEl = document.getElementById('mm-rec-agua-desc');
  const recFermentacionEl = document.getElementById('mm-rec-fermentacion');
  const recFermentacionDescEl = document.getElementById('mm-rec-fermentacion-desc');
  const recRefrigeracionEl = document.getElementById('mm-rec-refrigeracion');
  const recRefrigeracionDescEl = document.getElementById('mm-rec-refrigeracion-desc');
  const proTipEl = document.getElementById('mm-pro-tip');
  
  // Botón de actualización
  const refreshButton = document.getElementById('mm-refresh-button');
  
  // URL de tu función Vercel
  const WEATHER_API_URL = 'https://mm-weather-api.vercel.app/api/weather';
  
  // Función para actualizar la visualización del clima
  function updateWeatherDisplay(data) {
    // Actualizar datos básicos solo si los elementos existen
    if (temperatureEl) temperatureEl.textContent = data.temperature;
    if (humidityEl) humidityEl.textContent = data.humidity;
    if (windEl) windEl.textContent = data.windSpeed;
    
    // Actualizar icono del clima
    if (weatherIconEl) updateWeatherIcon(data.weatherId);
    
    // Actualizar el termómetro visual
    updateThermometer(data.temperature);
    
    // Calcular y mostrar el nivel de dificultad
    calculateFermentationLevel(data.temperature, data.humidity);
    
    // Generar recomendaciones
    generateRecommendations(data.temperature, data.humidity);
  }
  
  // Función para actualizar el termómetro visual
  function updateThermometer(temperature) {
    // Calcular posición del indicador (rango 24-42°C)
    const minTemp = 24;
    const maxTemp = 42;
    const position = ((temperature - minTemp) / (maxTemp - minTemp)) * 100;
    
    // Asegurar que la posición esté dentro del rango 0-100%
    const clampedPosition = Math.max(0, Math.min(100, position));
    
    // Actualizar la posición del indicador
    const temperatureIndicatorEl = document.getElementById('mm-temperature-indicator');
    if (temperatureIndicatorEl) {
      temperatureIndicatorEl.style.left = `${clampedPosition}%`;
      const indicatorValue = temperatureIndicatorEl.querySelector('.mm-indicator-value');
      if (indicatorValue) {
        indicatorValue.textContent = `${temperature}°C`;
      }
    }
  }
  
  // Función para actualizar el icono del clima
  function updateWeatherIcon(weatherId) {
    let iconClass = '';
    
    // Clasificación según OpenWeatherMap
    if (weatherId >= 200 && weatherId < 300) {
      iconClass = 'fa-bolt';
    } else if (weatherId >= 300 && weatherId < 400) {
      iconClass = 'fa-cloud-rain';
    } else if (weatherId >= 500 && weatherId < 600) {
      iconClass = 'fa-cloud-showers-heavy';
    } else if (weatherId >= 600 && weatherId < 700) {
      iconClass = 'fa-snowflake';
    } else if (weatherId >= 700 && weatherId < 800) {
      iconClass = 'fa-smog';
    } else if (weatherId === 800) {
      iconClass = 'fa-sun';
    } else if (weatherId > 800) {
      iconClass = 'fa-cloud';
    }
    
    if (weatherIconEl) {
      weatherIconEl.className = 'fas ' + iconClass;
    }
  }
  
  // Función para calcular el nivel de dificultad
  function calculateFermentationLevel(temperature, humidity) {
    let level, description, className;
    
    // Definir niveles basados en temperatura
    if (temperature < 20) {
      level = "EXTREMO";
      description = "Temperatura muy baja para una fermentación óptima. Tu masa madre estará inactiva y requerirá más tiempo y técnicas especiales.";
      className = "level-extreme";
    } else if (temperature < 24) {
      level = "ALTO";
      description = "Temperatura baja para fermentación. Tu masa madre trabajará lentamente, necesitando más tiempo y un mayor porcentaje de inoculante.";
      className = "level-high";
    } else if (temperature < 28) {
      level = "BAJO";
      description = "Condiciones ideales para fermentación de masa madre. Este es el rango óptimo para un pan con buen sabor y textura.";
      className = "level-low";
    } else if (temperature < 32) {
      level = "MEDIO-ALTO";
      description = "Temperatura elevada. Tu masa madre fermentará más rápido de lo normal, requiriendo ajustes en los tiempos y porcentajes.";
      className = "level-medium-high";
    } else if (temperature < 36) {
      level = "ALTO";
      description = "Temperatura alta. La fermentación será muy rápida, con riesgo de sobrefermentación y sabor excesivamente ácido.";
      className = "level-high";
    } else {
      level = "EXTREMO";
      description = "Temperatura extremadamente alta. Tu masa madre fermentará demasiado rápido, requiriendo técnicas especiales para controlar el proceso.";
      className = "level-extreme";
    }
    
    // Actualizar visualización del nivel
    if (levelValueEl) {
      levelValueEl.textContent = level;
      levelValueEl.className = "mm-level-value " + className;
      if (levelDescriptionEl) levelDescriptionEl.textContent = description;
    }
  }
  
  // Función para generar recomendaciones
  function generateRecommendations(temperature, humidity) {
    let inoculante, inoculanteDesc, agua, aguaDesc, fermentacion, fermentacionDesc, refrigeracion, refrigeracionDesc, proTip;
    
    // Recomendaciones basadas en temperatura
    if (temperature < 20) {
      inoculante = "30-40%";
      inoculanteDesc = "Aumenta el porcentaje de masa madre para acelerar la fermentación";
      agua = "30-35°C";
      aguaDesc = "Usa agua tibia para activar las levaduras";
      fermentacion = "5-7 horas";
      fermentacionDesc = "Tiempo extendido debido a la baja temperatura";
      refrigeracion = "No recomendada";
      refrigeracionDesc = "La refrigeración ralentizaría demasiado el proceso";
      proTip = "Coloca tu masa cerca de una fuente de calor indirecto (como el horno apagado con una taza de agua caliente) para mantener una temperatura constante.";
    } else if (temperature < 24) {
      inoculante = "25-30%";
      inoculanteDesc = "Porcentaje ligeramente mayor para una fermentación óptima";
      agua = "28-30°C";
      aguaDesc = "Agua ligeramente tibia para mantener la temperatura ideal";
      fermentacion = "4-5 horas";
      fermentacionDesc = "Tiempo ligeramente extendido";
      refrigeracion = "Opcional";
      refrigeracionDesc = "Solo para sabores más ácidos";
      proTip = "Monitorea tu masa cada 30 minutos durante la fermentación para evitar sobrefermentación.";
    } else if (temperature < 28) {
      inoculante = "20-25%";
      inoculanteDesc = "Porcentaje estándar para una fermentación equilibrada";
      agua = "24-26°C";
      aguaDesc = "Agua a temperatura ambiente ideal";
      fermentacion = "3-4 horas";
      fermentacionDesc = "Tiempo óptimo para una buena fermentación";
      refrigeracion = "Opcional";
      refrigeracionDesc = "Para sabores más complejos";
      proTip = "Este es el momento perfecto para experimentar con diferentes harinas y técnicas de fermentación.";
    } else if (temperature < 32) {
      inoculante = "15-20%";
      inoculanteDesc = "Reduce el porcentaje para controlar la velocidad de fermentación";
      agua = "20-22°C";
      aguaDesc = "Agua ligeramente fría para contrarrestar el calor";
      fermentacion = "2.5-3.5 horas";
      fermentacionDesc = "Tiempo reducido para evitar sobrefermentación";
      refrigeracion = "Recomendada (4-6h)";
      refrigeracionDesc = "Para controlar la fermentación y mejorar el sabor";
      proTip = "Realiza la fermentación final en refrigeración para obtener una miga más abierta y un sabor equilibrado.";
    } else if (temperature < 36) {
      inoculante = "10-15%";
      inoculanteDesc = "Porcentaje reducido para evitar fermentación excesiva";
      agua = "15-18°C";
      aguaDesc = "Agua fría para neutralizar el calor ambiental";
      fermentacion = "2-3 horas";
      fermentacionDesc = "Monitorea cada 30 minutos";
      refrigeracion = "Obligatoria (8-12h)";
      refrigeracionDesc = "Para controlar completamente la fermentación";
      proTip = "Si tu masa dobla en menos de 2 horas, refrigera inmediatamente para evitar que se colapse.";
    } else {
      inoculante = "8-12%";
      inoculanteDesc = "Mínimo porcentaje para controlar la fermentación";
      agua = "12-15°C";
      aguaDesc = "Agua fría (sin hielo) para contrarrestar el calor";
      fermentacion = "1.5-2.5 horas";
      fermentacionDesc = "Monitorea cada 20-30 minutos";
      refrigeracion = "Obligatoria (10-14h)";
      refrigeracionDesc = "Esencial para un buen resultado";
      proTip = "Evita usar hielo directamente, ya que el shock térmico puede matar parte de las levaduras. Mezcla 2/3 de agua del grifo con 1/3 de agua refrigerada.";
    }
    
    // Actualizar recomendaciones solo si los elementos existen
    if (recInoculanteEl) recInoculanteEl.textContent = inoculante;
    if (recInoculanteDescEl) recInoculanteDescEl.textContent = inoculanteDesc;
    if (recAguaEl) recAguaEl.textContent = agua;
    if (recAguaDescEl) recAguaDescEl.textContent = aguaDesc;
    if (recFermentacionEl) recFermentacionEl.textContent = fermentacion;
    if (recFermentacionDescEl) recFermentacionDescEl.textContent = fermentacionDesc;
    if (recRefrigeracionEl) recRefrigeracionEl.textContent = refrigeracion;
    if (recRefrigeracionDescEl) recRefrigeracionDescEl.textContent = refrigeracionDesc;
    if (proTipEl) proTipEl.textContent = proTip;
  }
  
  // Función para mostrar estado de error
  function showErrorState(errorMessage) {
    // Actualizar elementos solo si existen
    if (temperatureEl) {
      temperatureEl.textContent = 'N/A';
      humidityEl.textContent = 'N/A';
      windEl.textContent = 'N/A';
    }
    
    if (levelValueEl) {
      levelValueEl.textContent = 'ERROR';
      if (levelDescriptionEl) levelDescriptionEl.textContent = errorMessage || 'No se pudieron obtener los datos climáticos.';
    }
    
    // Limpiar recomendaciones solo si los elementos existen
    if (recInoculanteEl) recInoculanteEl.textContent = '--';
    if (recAguaEl) recAguaEl.textContent = '--';
    if (recFermentacionEl) recFermentacionEl.textContent = '--';
    if (recRefrigeracionEl) recRefrigeracionEl.textContent = '--';
    if (proTipEl) proTipEl.textContent = 'Hubo un problema al obtener los datos climáticos. Por favor, intenta actualizar.';
  }
  
  // Función para actualizar la hora de última actualización
  function updateLastUpdated() {
    const now = new Date();
    const options = { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true
    };
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = `Última actualización: ${now.toLocaleTimeString('es-MX', options)}`;
    }
  }
  
  // Función para obtener datos climáticos
  async function fetchWeatherData() {
    try {
      // Mostrar estado de carga solo si los elementos existen
      if (temperatureEl) temperatureEl.textContent = '...';
      if (humidityEl) humidityEl.textContent = '...';
      if (windEl) windEl.textContent = '...';
      
      // Añade un timestamp para evitar caché
      const urlWithTimestamp = `${WEATHER_API_URL}?t=${Date.now()}`;
      
      const response = await fetch(urlWithTimestamp, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      updateWeatherDisplay(data);
      updateLastUpdated();
      
    } catch (error) {
      console.error('Error al obtener datos climáticos:', error);
      showErrorState(error.message);
    }
  }
  
  // Inicializar
  fetchWeatherData();
  
  // Configurar actualización periódica cada 30 minutos
  setInterval(fetchWeatherData, 30 * 60 * 1000);
  
  // Configurar botón de actualización manual
  if (refreshButton) {
    refreshButton.addEventListener('click', fetchWeatherData);
  }
});