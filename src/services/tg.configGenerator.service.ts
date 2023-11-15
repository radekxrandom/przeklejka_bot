require('dotenv').config(); // Load environment variables from .env file

const tgToken = process.env.TELEGRAM_TOKEN; // Read the token value from the environment

if (!tgToken) {
  console.error('Discord Token not found in the .env file. Please provide a valid token.');
  process.exit(1); // Exit the process with an error code
}

module.exports = tgToken; // Export the configuration object
