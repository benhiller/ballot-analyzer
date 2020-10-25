require('dotenv').config();

module.exports = {
  client: 'postgresql',
  connection: process.env.PG_CONNECTION_STRING,
};
