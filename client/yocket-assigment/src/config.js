// config.js
let serverUrl;

if (process.env.NODE_ENV === 'development') {
  serverUrl = 'http://localhost:5000';
} else {
  serverUrl = 'https://example.com/api';
}

export default serverUrl;
