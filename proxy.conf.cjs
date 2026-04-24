const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const apiKey = process.env.API_FOOTBALL_KEY || '';

module.exports = {
  '/api/football': {
    target: 'https://v3.football.api-sports.io',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/api/football': '' },
    headers: apiKey
      ? {
          'x-apisports-key': apiKey
        }
      : {},
    logLevel: 'debug'
  }
};
