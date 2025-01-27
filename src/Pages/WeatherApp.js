import axios from "axios";
import { useState } from "react";
import styled from "styled-components";
import { IconPin, IconSearch } from "../components/Icons";
import Loader from "../components/Loader";

const DivWeather = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
`;

const BackgroundVideo = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1; /* Faz com que o vídeo fique atrás de outros elementos */
`;

const CardWeather = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: rgb(0, 9, 128);
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
  border-radius: 36px;
  padding: 20px;
  text-align: center;

  form {
    display: flex;
    max-width: 500px;
    align-items: center;
    gap: 8px;
    background: #090020;
    border-radius: 50px;
    padding: 8px 12px;
  }

  input {
    border: none;
    background: none;
    outline: none;
    color: white;
    font-size: 16px;
    padding: 8px 12px;
    flex: 1;
  }

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
  }

  h1 {
    font-size: 60px;
    text-align: center;
    color: white;
  }

  #city {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 5px;

    img {
      margin-top: 8px;
    }
  }
`;

const Line = styled.div`
  width: 100%;
  background-color: aliceblue;
  height: 2px;
  margin: 20px 0;
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;

  p {
    margin-top: 10px;
    font-size: 16px;
  }
`;

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);
  const [countryCode, setCountryCode] = useState("");
  const [cityName, setCityName] = useState("");

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const geocodeResponse = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          city
        )}&key=15634ad8f68b48349dd1084bb3757d0a`
      );

      if (
        !geocodeResponse.data.results ||
        geocodeResponse.data.results.length === 0
      ) {
        throw new Error(
          "Cidade não encontrada. Verifique o nome e tente novamente."
        );
      }

      const result = geocodeResponse.data.results[0];
      const lat = result.geometry.lat;
      const lng = result.geometry.lng;

      // Formatar o nome da cidade e estado (se disponível)
      const formattedCityName = result.components.city
      ? `${result.components.city}`
      : result.components.town || result.components.village || city;
    
    const formattedState = result.components.state
      ? `, ${result.components.state}`
      : "";
    const country = result.components.country_code;
    
    // Define os nomes formatados para cidade e estado
    setCityName(capitalizeCityName(formattedCityName + formattedState)); // Aqui
    setCountryCode(country);

      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );

      setWeatherData(weatherResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(
        error.response?.data?.message ||
          "Não foi possível encontrar a cidade ou os dados do clima."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Por favor, insira o nome de uma cidade.");
      return;
    }
    fetchWeatherData();
  };

  const capitalizeCityName = (cityName) => {
    return cityName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  

  return (
    <DivWeather>
      <BackgroundVideo
        src="289565-sunset-skies-wallpaper.jpg"
        type="video/mp4"
      ></BackgroundVideo>
      <CardWeather>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Digite o nome da cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            <IconSearch />
          </button>
        </form>

        <Line />

        {/* Loader e mensagem abaixo da linha */}
        <LoaderContainer>
          {loading && <Loader />}
          {!loading && !weatherData && !error && (
            <p>Procure o clima de uma cidade</p>
          )}
        </LoaderContainer>

        {/* Mensagens de erro */}
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}

        {/* Exibição de dados de clima */}
        {weatherData && cityName && (
          <div>
            <div id="city">
              <IconPin />
              <h2>
                {cityName}{" "}
                {countryCode && (
                  <img
                    src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
                    alt={`Bandeira de ${cityName}`}
                    style={{
                      width: "30px",
                      height: "20px",
                      marginLeft: "10px",
                    }}
                  />
                )}
              </h2>
            </div>
            <h1>{weatherData.current_weather.temperature}°C</h1>
            <h3 style={{ color: "white" }}>
              Velocidade do Vento: {weatherData.current_weather.windspeed} m/s
            </h3>
          </div>
        )}
      </CardWeather>
    </DivWeather>
  );
};

export default WeatherApp;
