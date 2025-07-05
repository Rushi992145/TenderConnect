const knex = require('knex');
const knexConfig = require('./knexfile');

const environment = process.env.NODE_ENV || 'development';
console.log('Database environment:', environment);
console.log('Available configs:', Object.keys(knexConfig));

const db = knex(knexConfig[environment]);

module.exports = db; 