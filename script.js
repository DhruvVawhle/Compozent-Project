document.addEventListener("DOMContentLoaded", () => {
    const apiKey = '370ae5317777573bd17ece7b1abacd5e';
    const cityInput = document.getElementById("cityInput");
    const searchButton = document.getElementById("searchButton");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const aboutSection = document.getElementById("about");
    const airQualitySection = document.getElementById("airQuality");
    const forecastSection = document.getElementById("forecast");

    // Function to fetch current weather data
    const fetchWeather = async (city) => {
        if (!city) {
            alert("Please enter a city name!");
            return;
        }

        try {
            loadingSpinner.style.display = "block"; // Show loading spinner
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.cod === 200) {
                displayWeather(data);
                fetchAirQuality(data.coord.lat, data.coord.lon); // Fetch Air Quality and Pollution data
                fetchForecast(data.coord.lat, data.coord.lon); // Fetch 5-Day Forecast
            } else {
                alert("City not found. Please try again!");
            }
        } catch (error) {
            console.error("Error fetching weather data:", error);
            alert("An error occurred while fetching the weather data. Check the console for more details.");
        } finally {
            loadingSpinner.style.display = "none"; // Hide loading spinner
        }
    };

    // Function to fetch 5-day forecast data
    const fetchForecast = async (lat, lon) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.cod === "200") {
                displayForecast(data);
            } else {
                console.error("Error fetching forecast data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching forecast data:", error);
        }
    };

    // Function to display current weather
    const displayWeather = (data) => {
        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temperatureC").textContent = Math.round(data.main.temp);
        document.getElementById("temperatureF").textContent = Math.round(data.main.temp * 9 / 5 + 32);
        document.getElementById("rainChance").textContent = data.weather[0].description;
        document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById("weatherInfo").style.display = "flex";

        // Hide "About Us" section after weather data is displayed
        aboutSection.style.display = "none";
    };

    // Function to fetch air quality data
    const fetchAirQuality = async (lat, lon) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.list && data.list[0]) {
                displayAirQuality(data.list[0]);
            } else {
                console.error("Error fetching air quality data");
            }
        } catch (error) {
            console.error("Error fetching air quality data:", error);
        }
    };

    // Function to display air quality data
    const displayAirQuality = (data) => {
        // Display AQI and PM10 values
        document.getElementById("airQualityIndex").textContent = data.main.aqi || "Not Available";
        document.getElementById("pollutionIndex").textContent = data.components.pm10 || "Not Available";
        airQualitySection.style.display = "block";  // Show the air quality section
    };

    // Function to display 5-day forecast
    const displayForecast = (data) => {
        const dayContainer = document.getElementById("dayContainer");
        dayContainer.innerHTML = ''; // Clear any previous forecast

        data.list.forEach((item, index) => {
            // Only show 5 data points (one for each day)
            if (index % 8 === 0) {
                const forecastCard = document.createElement("div");
                forecastCard.classList.add("forecast-card");

                const date = new Date(item.dt * 1000); // Convert timestamp to date
                const day = date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });

                forecastCard.innerHTML = `
                    <h3>${day}</h3>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="weather icon">
                    <p>${Math.round(item.main.temp)}°C / ${Math.round(item.main.temp * 9 / 5 + 32)}°F</p>
                `;

                dayContainer.appendChild(forecastCard);
            }
        });

        forecastSection.style.display = "block";  // Show the forecast section
    };

    // Event listener for the search button
    searchButton.addEventListener("click", () => {
        const city = cityInput.value.trim();
        fetchWeather(city);
    });

    // Event listener for the Enter key
    cityInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const city = cityInput.value.trim();
            fetchWeather(city);
        }
    });
});
