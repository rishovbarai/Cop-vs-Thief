// config.js
let serverUrl;

if (process.env.NODE_ENV === 'development') {
  serverUrl = 'http://localhost:5000';
} else {
  serverUrl = 'https://relaxed-toffee-f8cf71.netlify.app/.netlify/functions/api';
}

export default serverUrl;
