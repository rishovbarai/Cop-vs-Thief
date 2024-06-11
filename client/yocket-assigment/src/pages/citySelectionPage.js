import React, { useState, useEffect } from "react";
import serverUrl from '../config';
import { useNavigate } from "react-router-dom"; // Make sure you have react-router-dom installed

const COP_IDS = ["cop1", "cop2", "cop3"];
const VEHICLES = [
  { type: "EV Bike", range: 60, count: 2 },
  { type: "EV Car", range: 100, count: 1 },
  { type: "EV SUV", range: 120, count: 1 },
];

const cityDistances = {
  Yapkashnagar: 60,
  Lihaspur: 50,
  NarmisCity: 40,
  Shekharvati: 30,
  Nuravgram: 20,
};

function CitySelectionPage() {
  const [copCities, setCopCities] = useState({}); // Object to store chosen cities (cop ID as key, city name as value)
  const [availableCities, setAvailableCities] = useState(Object.keys(cityDistances)); // List of available cities
  const [copVehicles, setCopVehicles] = useState({}); // Object to store chosen vehicles (cop ID as key, vehicle object as value)
  const [selectedData, setSelectedData] = useState(COP_IDS.map(copId => ({ copId, city: "", vehicleType: "" }))); // Initialize selectedData with default values
  const [availableVehicles, setAvailableVehicles] = useState([...VEHICLES]); // Available vehicles with count
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    setAvailableCities(
      Object.keys(cityDistances).filter(
        (city) => !Object.values(copCities).includes(city)
      )
    );
  }, [copCities]);

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
    const chosenCity = copCities[copId];
    const selectedVehicle = availableVehicles.find(
      (vehicle) => vehicle.type === chosenVehicleType
    );

    if (selectedVehicle) {
      setCopVehicles((prevCopVehicles) => {
        const updatedCopVehicles = { ...prevCopVehicles, [copId]: selectedVehicle };

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

  const updateVehicleCount = (vehicleType, change) => {
    setAvailableVehicles((prevAvailableVehicles) =>
      prevAvailableVehicles.map((vehicle) => {
        if (vehicle.type === vehicleType) {
          return { ...vehicle, count: vehicle.count + change };
        }
        return vehicle;
      })
    );
  };

  const getAvailableVehicles = (cityDistance) => {
    const roundTripDistance = cityDistance * 2;
    return availableVehicles.filter(
      (vehicle) => vehicle.range >= roundTripDistance && vehicle.count > 0
    );
  };

  const handleSubmit = () => {
    // Check if all cops have selected both city and vehicle
    const isAllSelected = selectedData.every(
      (item) => item.city && item.vehicleType
    );

    if (isAllSelected) {
      // Call the function to submit data to the backend
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
    setSelectedData(COP_IDS.map(copId => ({ copId, city: "", vehicleType: "" })));
    setAvailableVehicles([...VEHICLES]);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {COP_IDS.map((copId) => (
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
                    availableCities.length === 0
                      ? "bg-gray-200 cursor-not-allowed"
                      : ""
                  }`}
                  value={copCities[copId]} // Always set the chosen city as the value
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
                  availableCities.length === 0
                    ? "bg-gray-200 cursor-not-allowed"
                    : ""
                }`}
                value={copCities[copId] || ""} // Set initial value if chosen
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
                value={copVehicles[copId]?.type || ""} // Set initial value if chosen
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
