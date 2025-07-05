const config = require('./config');

const knexConfig = {
  client: 'pg',
  connection: config.database,
  migrations: {
    directory: './migrations'
  }
};

module.exports = {
  development: knexConfig,
  production: knexConfig,
  test: knexConfig
};