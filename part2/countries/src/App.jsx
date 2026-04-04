import { useState, useEffect } from 'react'
import axios from 'axios'

const App = () => {
  const [search, setSearch] = useState('')
  const [countries, setCountries] = useState([])
  const [weather, setWeather] = useState(null)

  const api_key = import.meta.env.VITE_WEATHER_KEY

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
      .catch(err => console.error("Error fetching restcountries API", err))
  }, [])

  const filteredCountries = countries.filter(country =>
    country.name?.common?.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (filteredCountries.length === 1 && api_key) {
      const capitalArray = filteredCountries[0].capital
      if (capitalArray && capitalArray.length > 0) {
        const capital = capitalArray[0]
        axios
          .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${api_key}&units=metric`)
          .then(response => {
            setWeather(response.data)
          })
          .catch(error => console.error("Error fetching weather:", error))
      }
    } else {
      setWeather(null)
    }
  }, [filteredCountries.length, search, api_key])

  // Safely grab the one country if we have exactly 1 match
  const selectedCountry = filteredCountries.length === 1 ? filteredCountries[0] : null

  return (
    <div>
      <div>
        find countries: 
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredCountries.length > 10 && search.length > 0 && (
        <p>Too many matches, specify another filter</p>
      )}

      {filteredCountries.length <= 10 && filteredCountries.length > 1 && (
        <div>
          {filteredCountries.map(country => (
            <div key={country.name.common}>
              {country.name.common}
              <button style={{ marginLeft: "5px" }} onClick={() => setSearch(country.name.common)}>
                show
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedCountry && (
        <div>
          <h2>{selectedCountry.name.common}</h2>
          
          {selectedCountry.capital && (
            <p>Capital: {selectedCountry.capital[0]}</p>
          )}
          
          <p>Area: {selectedCountry.area}</p>

          <h3>Languages</h3>
          <ul>
            {selectedCountry.languages ? (
              Object.values(selectedCountry.languages).map(lang => (
                <li key={lang}>{lang}</li>
              ))
            ) : (
              <p>No official languages reported.</p>
            )}
          </ul>

          <img
            src={selectedCountry.flags?.png}
            alt={`Flag of ${selectedCountry.name.common}`}
            width="150"
          />

          {weather && selectedCountry.capital && (
            <div>
              <h3>Weather in {selectedCountry.capital[0]}</h3>
              <p>Temperature {weather.main?.temp} °C</p>
              {weather.weather && weather.weather[0] && (
                 <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="weather icon" />
              )}
              <p>Wind {weather.wind?.speed} m/s</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
