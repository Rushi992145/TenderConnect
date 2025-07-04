require('dotenv').config();

module.exports = {
    development: {
      client: 'pg',
      connection: {
        host: process.env.PGHOST || '127.0.0.1',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'tenderconnect',
        port: process.env.PGPORT || 5432,
        ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
        channelBinding: process.env.PGCHANNELBINDING || undefined
      },
      migrations: {
        directory: './migrations'
      }
    }
  };