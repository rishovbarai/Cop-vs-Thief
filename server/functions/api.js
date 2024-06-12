const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const serverless = require('serverless-http');
const router = express.Router();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use cors middleware to enable CORS
app.use(cors());

// Mock data for cities and vehicles
const cityDistances = {
    Yapkashnagar: 60,
    Lihaspur: 50,
    NarmisCity: 40,
    Shekharvati: 30,
    Nuravgram: 20,
};

const vehicles = [
    { type: 'EV Bike', range: 60, count: 2 },
    { type: 'EV Car', range: 100, count: 1 },
    { type: 'EV SUV', range: 120, count: 1 },
];

const COP_IDS = ["Abhishek", "Rana", "Pandit"];
const cities = Object.keys(cityDistances); // Define the cities array from the cityDistances object

// Route to get city distances
router.get('/cityDistances', (req, res) => {
    res.json(cityDistances);
});

// Route to get vehicles
router.get('/vehicles', (req, res) => {
    res.json(vehicles);
});

// Route to get cop IDs
router.get('/copIds', (req, res) => {
    res.json(COP_IDS);
});

// Function to randomly select a city for the fugitive's location
const getRandomCity = () => {
    const randomIndex = Math.floor(Math.random() * cities.length);
    return cities[randomIndex];
};

// Route to simulate the fugitive's location, compare with cop selections, and determine capture status
router.post('/capture-status', (req, res) => {
    try {
        // Extract cop selection data from the request body
        const copSelections = req.body;
        // Simulate the fugitive's location
        const fugitiveLocation = getRandomCity();

        // Check each cop's selection
        let capturedCop = null;
        for (const selection of copSelections) {
            const { copId, city, vehicleType } = selection;
            // Check if the cop's selected city matches the fugitive's location
            if (city === fugitiveLocation) {
                // Check if the cop's vehicle range is sufficient to reach the fugitive's location
                const cityDistance = cityDistances[city];
                const selectedVehicle = vehicles.find(vehicle => vehicle.type === vehicleType);
                
                if (selectedVehicle && selectedVehicle.range >= cityDistance) {
                    // If both conditions are met, the cop successfully captured the fugitive
                    capturedCop = copId;
                    break;
                }
            }
        }

        // Send the capture status response
        if (capturedCop) {
            res.json({ captured: true, copId: capturedCop, fugitiveLocation });
        } else {
            res.json({ captured: false, fugitiveLocation });
        }
    } catch (error) {
        console.error('Error in /capture-status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handler middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);

const port = 8080;
app.listen(process.env.PORT || port, ()=>{
    console.log(`server running on port ${port}`);
})
