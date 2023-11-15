require('dotenv').config(); // Load environment variables from .env file

const dcToken = process.env.DISCORD_TOKEN; // Read the token value from the environment

if (!dcToken) {
  console.error('Discord Token not found in the .env file. Please provide a valid token.');
  process.exit(1); // Exit the process with an error code
}

module.exports = dcToken; // Export the configuration object
