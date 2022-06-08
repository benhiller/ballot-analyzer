require('dotenv').config();

module.exports = {
  client: 'postgresql',
  version: '7.2',
  connection: process.env.PG_CONNECTION_STRING,
};
