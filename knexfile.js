module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
    useNullAsDefault: true,
  },

  psql: {
    client: 'postgresql',
    connection: process.env.PG_CONNECTION_STRING,
  },
};
