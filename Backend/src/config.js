require('dotenv').config();

const config = {
  database: {
    host: process.env.PGHOST || '127.0.0.1',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'tenderconnect',
    port: process.env.PGPORT || 5432,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
    channelBinding: process.env.PGCHANNELBINDING || undefined
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  server: {
    port: process.env.PORT || 4000
  }
};

console.log('Environment:', process.env.NODE_ENV);
console.log('Database config:', {
  host: config.database.host,
  user: config.database.user,
  database: config.database.database,
  port: config.database.port
});

module.exports = config; 