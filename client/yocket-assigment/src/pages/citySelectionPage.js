import React, { useState, useEffect } from "react";
import serverUrl from '../config';
import { useNavigate } from "react-router-dom";

function CitySelectionPage() {
  const [error, setError] = useState(null); // Initialize error state
  const [copCities, setCopCities] = useState({});
  const [availableCities, setAvailableCities] = useState([]);
  const [copVehicles, setCopVehicles] = useState({});
  const [selectedData, setSelectedData] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [cityDistances, setCityDistances] = useState({});
  const [copIds, setCopIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state for submission
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Initial loading state
  const [errors, setErrors] = useState({}); // Error state for vehicle availability
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch city distances
    fetch(`${serverUrl}/cityDistances`)
      .then(response => response.json())
      .then(data => {
        setCityDistances(data);
        setAvailableCities(Object.keys(data));
      })
      .catch(error => console.error('Error fetching city distances:', error));

    // Fetch vehicles
    fetch(`${serverUrl}/vehicles`)
      .then(response => response.json())
      .then(data => setAvailableVehicles(data))
      .catch(error => console.error('Error fetching vehicles:', error));

    // Fetch cop IDs
    fetch(`${serverUrl}/copIds`)
      .then(response => response.json())
      .then(data => {
        setCopIds(data);
        setSelectedData(data.map(copId => ({ copId, city: "", vehicleType: "" })));
      })
      .catch(error => console.error('Error fetching cop IDs:', error))
      .finally(() => setIsInitialLoading(false)); // End initial loading
  }, []);

  useEffect(() => {
    setAvailableCities(
      Object.keys(cityDistances).filter(
        (city) => !Object.values(copCities).includes(city)
      )
    );
  }, [copCities, cityDistances]);

  const handleCitySelection = (copId, chosenCity) => {
    // Reset cop vehicle selection when city changes
    setCopVehicles((prevCopVehicles) => ({
      ...prevCopVehicles,
      [copId]: null,
    }));
    const prevChosenVehicle = copVehicles[copId];
  if (prevChosenVehicle) {
    setAvailableVehicles((prevAvailableVehicles) =>
      prevAvailableVehicles.map((vehicle) =>
        vehicle.type === prevChosenVehicle.type
          ? { ...vehicle, count: vehicle.count + 1 } // Increment count
          : vehicle
      )
    );
  }

  setCopVehicles((prevCopVehicles) => ({
    ...prevCopVehicles,
    [copId]: null,
  }));
  
    setCopCities((prevCopCities) => {
      const updatedCopCities = { ...prevCopCities, [copId]: chosenCity };
  
      return updatedCopCities;
    });
  };
  
  const handleVehicleSelection = (copId, chosenVehicleType) => {
    const chosenCity = copCities[copId];
    const selectedVehicle = availableVehicles.find(
      (vehicle) => vehicle.type === chosenVehicleType && vehicle.count > 0
    );
  
    if (selectedVehicle) {
      setCopVehicles((prevCopVehicles) => ({
        ...prevCopVehicles,
        [copId]: selectedVehicle,
      }));
  
      // Update available vehicle count
      setAvailableVehicles((prevAvailableVehicles) =>
        prevAvailableVehicles.map((vehicle) =>
          vehicle.type === chosenVehicleType
            ? { ...vehicle, count: vehicle.count - 1 }
            : vehicle
        )
      );
  
      if (chosenCity) {
        updateSelectedData(copId, chosenCity, selectedVehicle.type);
      }
    }
  };
  
  
  
  
  

  const updateSelectedData = (copId, city, vehicleType) => {
    setSelectedData((prevSelectedData) =>
      prevSelectedData.map((item) =>
        item.copId === copId ? { ...item, city, vehicleType } : item
      )
    );
  };

  const getAvailableVehicles = (chosenCity) => {
    const cityDistance = cityDistances[chosenCity];
    if (!cityDistance) return [];
  
    const roundTripDistance = cityDistance * 2;
    return availableVehicles.filter(
      (vehicle) =>
        vehicle.range >= roundTripDistance &&
        vehicle.count > 0 &&
        !(copVehicles[chosenCity] && copVehicles[chosenCity].type === vehicle.type)
    );
  };

  const handleSubmit = () => {
    const isAllSelected = selectedData.every(
      (item) => item.city && item.vehicleType
    );

    if (isAllSelected) {
      setIsLoading(true); // Start loading
      submitSelections(selectedData);
    } else {
      setError("Please ensure all cops have selected a city and vehicle.");
    }
  };

  const submitSelections = async (data) => {
    try {
      const response = await fetch(`${serverUrl}/capture-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        navigate("/resultPage", { state: { result } });
      } else {
        console.error("Failed to submit selections");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const resetSelections = () => {
    setCopCities({});
    setCopVehicles({});
    setSelectedData(copIds.map(copId => ({ copId, city: "", vehicleType: "" })));
    setAvailableVehicles([...availableVehicles]);
    setErrors({}); // Clear errors
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/loader.gif" alt="Loading..." /> {/* Path to the loader GIF in public folder */}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 justify-center">
      {copIds.map((copId) => (
        <div key={copId} className="p-4 border rounded-lg shadow-md bg-white">
          <p className="text-lg font-semibold mb-2">Cop {copId}:</p>
          <div className="flex items-center gap-2 mb-4">
            <p className="font-medium">City:</p>
            {copCities[copId] ? (
              <>
                <span className="text-blue-500 font-bold mr-2">
                  {copCities[copId]}
                </span>
                <select
                  className={`border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    availableCities.length === 0 ? "bg-gray-200 cursor-not-allowed" : ""
                  }`}
                  value={copCities[copId]} 
                  onChange={(e) => handleCitySelection(copId, e.target.value)}
                >
                  <option value="">Choose City</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <select
                className={`border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  availableCities.length === 0 ? "bg-gray-200 cursor-not-allowed" : ""
                }`}
                value={copCities[copId] || ""} 
                onChange={(e) => handleCitySelection(copId, e.target.value)}
                disabled={availableCities.length === 0}
              >
                <option value="">Choose City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
          </div>
          {copCities[copId] && (
            <div className="flex items-center gap-2 mb-4">
              <p className="font-medium">City Distance:</p>
              <span className="text-gray-700">
                {cityDistances[copCities[copId]]} km
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <p className="font-medium">Vehicle:</p>
            {copVehicles[copId] ? (
              <>
                <span className="text-blue-500 font-bold mr-2">
                  {copVehicles[copId].type}
                </span>
                <select
                  className={`border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={copVehicles[copId].type}
                  onChange={(e) =>
                    handleVehicleSelection(copId, e.target.value)
                  }
                >
                  <option value="">Choose Vehicle</option>
                  {getAvailableVehicles(copCities[copId]).map((vehicle) => (
                    <option key={vehicle.type} value={vehicle.type}>
                      {vehicle.type                      } (Range: {vehicle.range} km, Available: {vehicle.count})
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <select
                className={`border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value=""
                onChange={(e) => handleVehicleSelection(copId, e.target.value)}
                disabled={!copCities[copId]}
              >
                <option value="">Choose Vehicle</option>
                {copCities[copId] && getAvailableVehicles(copCities[copId]).length === 0 && (
                  <option disabled>No vehicle available for the city. Please choose another city.</option>
                )}
                {copCities[copId] && getAvailableVehicles(copCities[copId]).map(
                  (vehicle) => (
                    <option key={vehicle.type} value={vehicle.type}>
                      {vehicle.type} (Range: {vehicle.range} km, Available: {vehicle.count})
                    </option>
                  )
                )}
              </select>
            )}
          </div>
          {errors[copId] && (
            <p className="text-red-500 text-sm mb-2">{errors[copId]}</p>
          )}
        </div>
      ))}
      {error && (
      <div className="flex items-center justify-center w-64 h-12 bg-gray-200 rounded-md shadow-md">
        <p className="text-red-500 text-sm mb-2">{error}</p>
      </div>
    )}
      <div className="flex justify-center gap-4 mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-600 focus:outline-none"
          onClick={resetSelections}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default CitySelectionPage;

