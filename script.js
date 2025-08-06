document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM - VERIFICAMOS QUE EXISTAN ANTES DE USARLOS
  const temperatureEl = document.getElementById('mm-temperature');
  const humidityEl = document.getElementById('mm-humidity');
  const altitudeEl = document.getElementById('mm-altitude');
  const weatherIconEl = document.getElementById('mm-weather-icon');
  const lastUpdatedEl = document.getElementById('mm-last-updated');
  const currentDateEl = document.getElementById('mm-current-date');
  const levelValueEl = document.getElementById('mm-level-value');
  const levelDescriptionEl = document.getElementById('mm-level-description');
  
  // Elementos de recomendaciones
  const recMasaMadreEl = document.getElementById('mm-rec-masa-madre');
  const recMasaMadreDescEl = document.getElementById('mm-rec-masa-madre-desc');
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
  
  // Configuración de Monterrey
  const MONTERREY_ALTITUDE = 540; // metros sobre el nivel del mar
  
  // Rango de temperatura para el termómetro
  const MIN_TEMP = 0;
  const MAX_TEMP = 42;
  const OPTIMAL_MIN = 24;
  const OPTIMAL_MAX = 28;
  
  // Función para actualizar la fecha actual
  function updateCurrentDate() {
    const now = new Date();
    const options = { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    // Formatear la fecha en español con primera letra mayúscula
    const dateString = now.toLocaleDateString('es-MX', options);
    const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    
    if (currentDateEl) {
      currentDateEl.textContent = formattedDate;
    }
  }
  
  // Función para actualizar la visualización del clima
  function updateWeatherDisplay(data) {
    // Actualizar datos básicos solo si los elementos existen
    if (temperatureEl) temperatureEl.textContent = data.temperature;
    if (humidityEl) humidityEl.textContent = data.humidity;
    
    // Mostrar la altitud de Monterrey
    if (altitudeEl) altitudeEl.textContent = MONTERREY_ALTITUDE;
    
    // Actualizar icono del clima
    if (weatherIconEl) updateWeatherIcon(data.weatherId);
    
    // Actualizar el termómetro visual
    updateThermometer(data.temperature);
    
    // Calcular y mostrar el nivel de dificultad
    calculateFermentationLevel(data.temperature, data.humidity);
    
    // Generar recomendaciones
    generateRecommendations(data.temperature, data.humidity);
    
    // Ajustar posición de la leyenda según la temperatura
    adjustOptimalZoneLabel(data.temperature);
  }
  
  // Función para ajustar la posición de la leyenda
  function adjustOptimalZoneLabel(temperature) {
    const labelEl = document.querySelector('.mm-optimal-zone-label');
    if (!labelEl) return;
    
    // Si la temperatura está dentro de la zona óptima, mover la leyenda ligeramente
    if (temperature >= 24 && temperature <= 28) {
      // Calcular posición relativa dentro de la zona óptima (0-1)
      const positionInZone = (temperature - 24) / 4;
      
      // Si está en el primer 30% de la zona, mover a la derecha
      if (positionInZone < 0.3) {
        labelEl.style.left = '45%';
      } 
      // Si está en el último 30% de la zona, mover a la izquierda
      else if (positionInZone > 0.7) {
        labelEl.style.left = '55%';
      }
      // Si está en el centro, usar posición predeterminada
      else {
        labelEl.style.left = '50%';
      }
    } 
    // Si no está en la zona óptima, usar posición predeterminada
    else {
      labelEl.style.left = '50%';
    }
  }
  
  // Función para actualizar el termómetro visual con gradiente verde único
  function updateThermometer(temperature) {
    // Calcular posición del indicador (rango 0-42°C)
    const position = ((temperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * 100;
    
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
      level = "ALTO";
      description = "Temperatura baja para fermentación. Tu masa madre trabajará lentamente, necesitando más tiempo y un mayor porcentaje de inoculante.";
      className = "level-high";
    } else if (temperature < 24) {
      level = "MEDIO-BAJO";
      description = "Temperatura ligeramente baja. Tu masa madre fermentará más lento de lo normal.";
      className = "level-medium-low";
    } else if (temperature < 28) {
      level = "BAJO";
      description = "Condiciones ideales para fermentación de masa madre. Este es el rango óptimo para un pan con buen sabor y textura.";
      className = "level-low";
    } else if (temperature < 32) {
      level = "MEDIO-ALTO";
      description = "Temperatura elevada. Tu masa madre fermentará más rápido de lo normal, requiriendo ajustes en los tiempos y porcentajes.";
      className = "level-medium-high";
    } else {
      level = "ALTO";
      description = "Temperatura alta. La fermentación será muy rápida, con riesgo de sobrefermentación y sabor excesivamente ácido.";
      className = "level-high";
    }
    
    // Actualizar visualización del nivel
    if (levelValueEl) {
      levelValueEl.textContent = level;
      
      // Si no es óptimo (fuera de 24-28°C), usar color verde oscuro
      if (temperature < 24 || temperature >= 28) {
        levelValueEl.className = "mm-level-value level-not-optimal";
      } else {
        levelValueEl.className = "mm-level-value " + className;
      }
      
      if (levelDescriptionEl) levelDescriptionEl.textContent = description;
    }
  }
  
  // Función para generar recomendaciones
  function generateRecommendations(temperature, humidity) {
    let masaMadre, masaMadreDesc, agua, aguaDesc, fermentacion, fermentacionDesc, refrigeracion, refrigeracionDesc, proTip;
    
    // Recomendaciones basadas en temperatura
    if (temperature < 20) {
      masaMadre = "30-40%";
      masaMadreDesc = "Aumenta el porcentaje de masa madre para acelerar la fermentación";
      agua = "30-35°C";
      aguaDesc = "Usa agua tibia para activar las levaduras";
      fermentacion = "5-7 horas";
      fermentacionDesc = "Tiempo extendido debido a la baja temperatura";
      refrigeracion = "No recomendada";
      refrigeracionDesc = "La refrigeración ralentizaría demasiado el proceso";
      proTip = "Coloca tu masa cerca de una fuente de calor indirecto (como el horno apagado con una taza de agua caliente) para mantener una temperatura constante.";
    } else if (temperature < 24) {
      masaMadre = "25-30%";
      masaMadreDesc = "Porcentaje ligeramente mayor para una fermentación óptima";
      agua = "28-30°C";
      aguaDesc = "Agua ligeramente tibia para mantener la temperatura ideal";
      fermentacion = "4-5 horas";
      fermentacionDesc = "Tiempo ligeramente extendido";
      refrigeracion = "Opcional";
      refrigeracionDesc = "Solo para sabores más ácidos";
      proTip = "Monitorea tu masa cada 30 minutos durante la fermentación para evitar sobrefermentación.";
    } else if (temperature < 28) {
      masaMadre = "20-25%";
      masaMadreDesc = "Porcentaje estándar para una fermentación equilibrada";
      agua = "24-26°C";
      aguaDesc = "Agua a temperatura ambiente ideal";
      fermentacion = "3-4 horas";
      fermentacionDesc = "Tiempo óptimo para una buena fermentación";
      refrigeracion = "Opcional";
      refrigeracionDesc = "Para sabores más complejos";
      proTip = "Este es el momento perfecto para experimentar con diferentes harinas y técnicas de fermentación.";
    } else if (temperature < 32) {
      masaMadre = "15-20%";
      masaMadreDesc = "Reduce el porcentaje para controlar la velocidad de fermentación";
      agua = "20-22°C";
      aguaDesc = "Agua ligeramente fría para contrarrestar el calor";
      fermentacion = "2.5-3.5 horas";
      fermentacionDesc = "Tiempo reducido para evitar sobrefermentación";
      refrigeracion = "Recomendada (4-6h)";
      refrigeracionDesc = "Para controlar la fermentación y mejorar el sabor";
      proTip = "Realiza la fermentación final en refrigeración para obtener una miga más abierta y un sabor equilibrado.";
    } else {
      masaMadre = "10-15%";
      masaMadreDesc = "Porcentaje reducido para evitar fermentación excesiva";
      agua = "15-18°C";
      aguaDesc = "Agua fría para neutralizar el calor ambiental";
      fermentacion = "2-3 horas";
      fermentacionDesc = "Monitorea cada 30 minutos";
      refrigeracion = "Obligatoria (8-12h)";
      refrigeracionDesc = "Para controlar completamente la fermentación";
      proTip = "Si tu masa dobla en menos de 2 horas, refrigera inmediatamente para evitar que se colapse.";
    }
    
    // Actualizar recomendaciones solo si los elementos existen
    if (recMasaMadreEl) recMasaMadreEl.textContent = masaMadre;
    if (recMasaMadreDescEl) recMasaMadreDescEl.textContent = masaMadreDesc;
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
      if (altitudeEl) altitudeEl.textContent = 'N/A';
    }
    
    if (levelValueEl) {
      levelValueEl.textContent = 'ERROR';
      levelValueEl.className = "mm-level-value level-not-optimal";
      if (levelDescriptionEl) levelDescriptionEl.textContent = errorMessage || 'No se pudieron obtener los datos climáticos.';
    }
    
    // Limpiar recomendaciones solo si los elementos existen
    if (recMasaMadreEl) recMasaMadreEl.textContent = '--';
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
      if (altitudeEl) altitudeEl.textContent = '...';
      
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
  updateCurrentDate(); // Actualizar la fecha
  fetchWeatherData();
  
  // Configurar actualización periódica cada 30 minutos
  setInterval(fetchWeatherData, 30 * 60 * 1000);
  
  // Configurar botón de actualización manual
  if (refreshButton) {
    refreshButton.addEventListener('click', fetchWeatherData);
  }
});
