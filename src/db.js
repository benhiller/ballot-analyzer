import ServerlessClient from 'serverless-postgres';

const db = new ServerlessClient({
  connectionString: process.env.PG_CONNECTION_STRING,
  maxConnections: 15,
});
// Use knex just as a query builder
export const knex = require('knex')({ client: 'pg' });

export default db;
