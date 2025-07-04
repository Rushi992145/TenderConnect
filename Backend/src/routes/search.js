const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /search/companies?name=...&industry=...&service=...
router.get('/companies', async (req, res) => {
  const { name, industry, service } = req.query;
  try {
    let query = db('companies')
      .select('companies.id', 'companies.name', 'companies.industry', 'companies.description', 'companies.logo_url', 'companies.created_at')
      .leftJoin('goods_services', 'companies.id', 'goods_services.company_id');

    if (name) {
      query = query.whereILike('companies.name', `%${name}%`);
    }
    if (industry) {
      query = query.whereILike('companies.industry', `%${industry}%`);
    }
    if (service) {
      query = query.whereILike('goods_services.name', `%${service}%`);
    }

    // Group by company to avoid duplicates
    const companies = await query.groupBy('companies.id');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 