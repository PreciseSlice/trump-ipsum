module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/trump_ipsum',
    migrations: {
      directory: './db/migrations'
    },
    useNullAsDefault: true,
  }
};
