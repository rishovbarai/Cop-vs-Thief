import React, { useState, useEffect } from "react";
import serverUrl from '../config';
import { useNavigate } from "react-router-dom";

function CitySelectionPage() {
  const [copCities, setCopCities] = useState({});
  const [availableCities, setAvailableCities] = useState([]);
  const [copVehicles, setCopVehicles] = useState({});
  const [selectedData, setSelectedData] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [cityDistances, setCityDistances] = useState({});
  const [copIds, setCopIds] = useState([]);
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
      .catch(error => console.error('Error fetching cop IDs:', error));
  }, []);

  useEffect(() => {
    setAvailableCities(
      Object.keys(cityDistances).filter(
        (city) => !Object.values(copCities).includes(city)
      )
    );
  }, [copCities, cityDistances]);

  const handleCitySelection = (copId, chosenCity) => {
    const currentVehicle = copVehicles[copId];
    setCopCities((prevCopCities) => {
      const updatedCopCities = { ...prevCopCities, [copId]: chosenCity };

      if (currentVehicle) {
        updateSelectedData(copId, chosenCity, currentVehicle.type);
      }

      return updatedCopCities;
    });
  };

  const handleVehicleSelection = (copId, chosenVehicleType) => {
    const previousVehicle = copVehicles[copId];
    const chosenCity = copCities[copId];
    const selectedVehicle = availableVehicles.find(
      (vehicle) => vehicle.type === chosenVehicleType
    );

    if (selectedVehicle) {
      setCopVehicles((prevCopVehicles) => {
        const updatedCopVehicles = { ...prevCopVehicles, [copId]: selectedVehicle };
         // Update available vehicle count
       setAvailableVehicles(prevAvailableVehicles => 
        prevAvailableVehicles.map(vehicle => {
          if (vehicle.type === chosenVehicleType) {
            return { ...vehicle, count: vehicle.count - 1 };
          } else if (previousVehicle && vehicle.type === previousVehicle.type) {
            return { ...vehicle, count: vehicle.count + 1 };
          }
          return vehicle;
        })
      );
        if (chosenCity) {
          updateSelectedData(copId, chosenCity, selectedVehicle.type);
        }

        return updatedCopVehicles;
      });
    }
  };

  const updateSelectedData = (copId, city, vehicleType) => {
    setSelectedData((prevSelectedData) =>
      prevSelectedData.map((item) =>
        item.copId === copId ? { ...item, city, vehicleType } : item
      )
    );
  };

  const getAvailableVehicles = (cityDistance) => {
    const roundTripDistance = cityDistance * 2;
    return availableVehicles.filter(
      (vehicle) => vehicle.range >= roundTripDistance && vehicle.count > 0
    );
  };

  const handleSubmit = () => {
    const isAllSelected = selectedData.every(
      (item) => item.city && item.vehicleType
    );

    if (isAllSelected) {
      submitSelections(selectedData);
    } else {
      console.error("All cops must select both city and vehicle.");
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
    }
  };

  const resetSelections = () => {
    setCopCities({});
    setCopVehicles({});
    setSelectedData(copIds.map(copId => ({ copId, city: "", vehicleType: "" })));
    setAvailableVehicles([...availableVehicles]);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
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
                            <div className="flex items-center gap-2">
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
                                    {getAvailableVehicles(cityDistances[copCities[copId]]).map(
                                      (vehicle) => (
                                        <option key={vehicle.type} value={vehicle.type}>
                                          {vehicle.type} (Range: {vehicle.range} km, Available:{" "}
                                          {vehicle.count})
                                        </option>
                                      )
                                    )}
                                  </select>
                                </>
                              ) : (
                                <select
                                  className={`border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    getAvailableVehicles(cityDistances[copCities[copId]])
                                      .length === 0
                                      ? "bg-gray-200 cursor-not-allowed"
                                      : ""
                                  }`}
                                  value={copVehicles[copId]?.type || ""} 
                                  onChange={(e) => handleVehicleSelection(copId, e.target.value)}
                                  disabled={
                                    !copCities[copId] ||
                                    getAvailableVehicles(cityDistances[copCities[copId]])
                                      .length === 0
                                  }
                                >
                                  <option value="">Choose Vehicle</option>
                                  {getAvailableVehicles(cityDistances[copCities[copId]]).map(
                                    (vehicle) => (
                                      <option key={vehicle.type} value={vehicle.type}>
                                        {vehicle.type} (Range: {vehicle.range} km, Available:{" "}
                                        {vehicle.count})
                                      </option>
                                    )
                                  )}
                                </select>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md"
                          onClick={handleSubmit}
                        >
                          Submit Selections
                        </button>
                        <button
                          className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md"
                          onClick={resetSelections}
                        >
                          Reset Selections
                        </button>
                      </div>
                    );
                  }
                  
                  export default CitySelectionPage;
                  
                   
