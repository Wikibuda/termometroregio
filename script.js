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
  const userLocationEl = document.getElementById('mm-user-location');
  
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
  
  // Elementos para advertencias de altitud y humedad
  const altitudeWarningEl = document.getElementById('mm-altitude-warning');
  const humidityWarningEl = document.getElementById('mm-humidity-warning');
  
  // Botón de actualización
  const refreshButton = document.getElementById('mm-refresh-button');
  
  // Variables de ubicación
  let userLatitude = null;
  let userLongitude = null;
  let userCity = null;
  let userState = null;
  
  // URL de tu función Vercel
  const WEATHER_API_URL = 'https://mm-weather-api.vercel.app/api/weather';
  
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
  
  // Función para obtener la ubicación del usuario
  function getUserLocation() {
    if (userLocationEl) {
      userLocationEl.textContent = 'Obteniendo ubicación...';
      userLocationEl.className = 'mm-user-location mm-location-loading';
    }
    
    if (!navigator.geolocation) {
      if (userLocationEl) {
        userLocationEl.textContent = 'Geolocalización no soportada por tu navegador';
        userLocationEl.className = 'mm-user-location';
      }
      // Usar ubicación por defecto (Monterrey) si no hay geolocalización
      userLatitude = 25.6866;
      userLongitude = -100.3161;
      userCity = 'Monterrey';
      userState = 'NL';
      fetchWeatherData();
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;
        
        // Obtener el nombre de la ciudad y estado
        reverseGeocode(userLatitude, userLongitude);
      },
      (error) => {
        console.error('Error al obtener ubicación:', error);
        if (userLocationEl) {
          userLocationEl.textContent = 'No se pudo obtener tu ubicación';
          userLocationEl.className = 'mm-user-location';
        }
        
        // Usar ubicación por defecto (Monterrey) si falla la geolocalización
        userLatitude = 25.6866;
        userLongitude = -100.3161;
        userCity = 'Monterrey';
        userState = 'NL';
        fetchWeatherData();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }
  
  // Función para obtener el nombre de la ciudad y estado
  function reverseGeocode(latitude, longitude) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`)
      .then(response => response.json())
      .then(data => {
        userCity = data.address.city || data.address.town || data.address.village || 'Ubicación desconocida';
        userState = data.address.state || 'Estado desconocido';
        
        // Actualizar la ubicación en la interfaz
        if (userLocationEl) {
          userLocationEl.textContent = `${userCity}, ${userState}`;
          userLocationEl.className = 'mm-user-location';
        }
        
        // Obtener datos climáticos
        fetchWeatherData();
      })
      .catch(error => {
        console.error('Error en reverse geocoding:', error);
        
        // Si falla el reverse geocoding, usar los valores por defecto
        userCity = 'Ubicación';
        userState = 'desconocida';
        
        if (userLocationEl) {
          userLocationEl.textContent = `${userCity}, ${userState}`;
          userLocationEl.className = 'mm-user-location';
        }
        
        fetchWeatherData();
      });
  }
  
  // Función para actualizar la visualización del clima
  function updateWeatherDisplay(data) {
    // Actualizar datos básicos solo si los elementos existen
    if (temperatureEl) temperatureEl.textContent = data.temperature;
    if (humidityEl) humidityEl.textContent = data.humidity;
    
    // Mostrar la altitud basada en la ubicación
    if (altitudeEl) altitudeEl.textContent = data.altitude || 'N/A';
    
    // Actualizar icono del clima
    if (weatherIconEl) updateWeatherIcon(data.weatherId);
    
    // Actualizar el termómetro visual
    updateThermometer(data.temperature);
    
    // Calcular y mostrar el nivel de dificultad
    calculateFermentationLevel(data.temperature, data.humidity);
    
    // Generar recomendaciones
    generateRecommendations(data.temperature, data.humidity, data.altitude);
    
    // Ajustar posición de la leyenda según la temperatura
    adjustOptimalZoneLabel(data.temperature);
    
    // Mostrar advertencias de altitud y humedad
    showAltitudeWarning(data.altitude);
    showHumidityWarning(data.humidity);
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
    const MIN_TEMP = 0;
    const MAX_TEMP = 42;
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
  
  // Función para mostrar advertencia de altitud
  function showAltitudeWarning(altitude) {
    if (!altitudeWarningEl) return;
    
    let warningMessage = '';
    
    // Mostrar advertencia si la altitud es significativa
    if (altitude > 300) {
      if (altitude > 2500) {
        warningMessage = '⚠️ Altitud muy alta: Reduce ligeramente la cantidad de masa madre y acorta los tiempos de fermentación.';
      } else if (altitude > 1500) {
        warningMessage = '⚠️ Altitud elevada: Ajusta los tiempos de fermentación, serán ligeramente más cortos.';
      } else if (altitude > 500) {
        warningMessage = '⚠️ Altitud moderada: Los tiempos de fermentación pueden ser ligeramente más cortos que a nivel del mar.';
      }
    }
    
    altitudeWarningEl.innerHTML = warningMessage;
  }
  
  // Función para mostrar advertencia de humedad
  function showHumidityWarning(humidity) {
    if (!humidityWarningEl) return;
    
    let warningMessage = '';
    
    // Mostrar advertencia según el nivel de humedad
    if (humidity > 70) {
      warningMessage = '💧 Alta humedad: Reduce ligeramente el agua en tu receta, la harina absorbe menos agua en ambientes húmedos.';
    } else if (humidity < 40) {
      warningMessage = '💧 Baja humedad: Aumenta ligeramente el agua en tu receta, la harina absorbe más agua en ambientes secos.';
    }
    
    humidityWarningEl.innerHTML = warningMessage;
  }
  
  // Función para generar recomendaciones considerando temperatura, humedad y altitud
  function generateRecommendations(temperature, humidity, altitude) {
    let masaMadre, masaMadreDesc, agua, aguaDesc, fermentacion, fermentacionDesc, refrigeracion, refrigeracionDesc, proTip;
    
    // Factor de ajuste por altitud
    const altitudeFactor = altitude > 0 ? 1 - (altitude / 3000) : 1;
    
    // Factor de ajuste por humedad
    const humidityFactor = humidity > 70 ? 0.9 : humidity < 40 ? 1.1 : 1;
    
    // Factor combinado
    const combinedFactor = altitudeFactor * humidityFactor;
    
    // Recomendaciones basadas en temperatura
    if (temperature < 20) {
      masaMadre = Math.round(30 * combinedFactor) + "-" + Math.round(40 * combinedFactor) + "%";
      masaMadreDesc = "Aumenta el porcentaje de masa madre para acelerar la fermentación";
      agua = Math.round(30 * combinedFactor) + "-" + Math.round(35 * combinedFactor) + "°C";
      aguaDesc = "Usa agua tibia para activar las levaduras";
      fermentacion = Math.round(5 * combinedFactor) + "-" + Math.round(7 * combinedFactor) + " horas";
      fermentacionDesc = "Tiempo extendido debido a la baja temperatura";
      refrigeracion = "No recomendada";
      refrigeracionDesc = "La refrigeración ralentizaría demasiado el proceso";
      proTip = "Coloca tu masa cerca de una fuente de calor indirecto (como el horno apagado con una taza de agua caliente) para mantener una temperatura constante.";
    } else if (temperature < 24) {
      masaMadre = Math.round(25 * combinedFactor) + "-" + Math.round(30 * combinedFactor) + "%";
      masaMadreDesc = "Porcentaje ligeramente mayor para una fermentación óptima";
      agua = Math.round(28 * combinedFactor) + "-" + Math.round(30 * combinedFactor) + "°C";
      aguaDesc = "Agua ligeramente tibia para mantener la temperatura ideal";
      fermentacion = Math.round(4 * combinedFactor) + "-" + Math.round(5 * combinedFactor) + " horas";
      fermentacionDesc = "Tiempo ligeramente extendido";
      refrigeracion = "Opcional";
      refrigeracionDesc = "Solo para sabores más ácidos";
      proTip = "Monitorea tu masa cada 30 minutos durante la fermentación para evitar sobrefermentación.";
    } else if (temperature < 28) {
      masaMadre = Math.round(20 * combinedFactor) + "-" + Math.round(25 * combinedFactor) + "%";
      masaMadreDesc = "Porcentaje estándar para una fermentación equilibrada";
      agua = Math.round(24 * combinedFactor) + "-" + Math.round(26 * combinedFactor) + "°C";
      aguaDesc = "Agua a temperatura ambiente ideal";
      fermentacion = Math.round(3 * combinedFactor) + "-" + Math.round(4 * combinedFactor) + " horas";
      fermentacionDesc = "Tiempo óptimo para una buena fermentación";
      refrigeracion = "Opcional";
      refrigeracionDesc = "Para sabores más complejos";
      proTip = "Este es el momento perfecto para experimentar con diferentes harinas y técnicas de fermentación.";
    } else if (temperature < 32) {
      masaMadre = Math.round(15 * combinedFactor) + "-" + Math.round(20 * combinedFactor) + "%";
      masaMadreDesc = "Reduce el porcentaje para controlar la velocidad de fermentación";
      agua = Math.round(20 * combinedFactor) + "-" + Math.round(22 * combinedFactor) + "°C";
      aguaDesc = "Agua ligeramente fría para contrarrestar el calor";
      fermentacion = Math.round(2.5 * combinedFactor) + "-" + Math.round(3.5 * combinedFactor) + " horas";
      fermentacionDesc = "Tiempo reducido para evitar sobrefermentación";
      refrigeracion = "Recomendada (" + Math.round(4 * combinedFactor) + "-" + Math.round(6 * combinedFactor) + "h)";
      refrigeracionDesc = "Para controlar la fermentación y mejorar el sabor";
      proTip = "Realiza la fermentación final en refrigeración para obtener una miga más abierta y un sabor equilibrado.";
    } else {
      masaMadre = Math.round(10 * combinedFactor) + "-" + Math.round(15 * combinedFactor) + "%";
      masaMadreDesc = "Porcentaje reducido para evitar fermentación excesiva";
      agua = Math.round(15 * combinedFactor) + "-" + Math.round(18 * combinedFactor) + "°C";
      aguaDesc = "Agua fría para neutralizar el calor ambiental";
      fermentacion = Math.round(2 * combinedFactor) + "-" + Math.round(3 * combinedFactor) + " horas";
      fermentacionDesc = "Monitorea cada 30 minutos";
      refrigeracion = "Obligatoria (" + Math.round(8 * combinedFactor) + "-" + Math.round(12 * combinedFactor) + "h)";
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
    
    // Limpiar advertencias
    if (altitudeWarningEl) altitudeWarningEl.innerHTML = '';
    if (humidityWarningEl) humidityWarningEl.innerHTML = '';
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
      
      // Si no tenemos coordenadas, obtener la ubicación
      if (userLatitude === null || userLongitude === null) {
        getUserLocation();
        return;
      }
      
      // Añade un timestamp para evitar caché
      const urlWithTimestamp = `${WEATHER_API_URL}?lat=${userLatitude}&lon=${userLongitude}&t=${Date.now()}`;
      
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
  getUserLocation(); // Obtener la ubicación del usuario
  
  // Configurar actualización periódica cada 30 minutos
  setInterval(fetchWeatherData, 30 * 60 * 1000);
  
  // Configurar botón de actualización manual
  if (refreshButton) {
    refreshButton.addEventListener('click', fetchWeatherData);
  }
});
