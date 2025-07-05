const express = require('express');
const db = require('../db');

const router = express.Router();

// Test endpoint to check companies
router.get('/test-companies', async (req, res) => {
  try {
    const companies = await db('companies').select('*');
    res.json({
      count: companies.length,
      companies: companies
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Simple test endpoint for basic company search
router.get('/test-search', async (req, res) => {
  try {
    const companies = await db('companies')
      .select('id', 'name', 'industry')
      .limit(5);
    res.json({
      success: true,
      companies: companies
    });
  } catch (err) {
    console.error('Test search error:', err);
    res.status(500).json({ error: 'Test search failed', details: err.message });
  }
});

// GET /search/companies?name=...&industry=...&service=...&page=...&limit=...
router.get('/companies', async (req, res) => {
  const { name, industry, service, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  try {
    // Start with a simple query
    let query = db('companies')
      .select(
        'companies.id',
        'companies.name',
        'companies.industry',
        'companies.description',
        'companies.logo_url',
        'companies.created_at'
      );

    // Build search conditions
    if (name) {
      query = query.where('companies.name', 'ilike', `%${name}%`);
    }
    if (industry) {
      query = query.where('companies.industry', 'ilike', `%${industry}%`);
    }

    // If service filter is applied, we need to find companies that have this service
    let companyIds = null;
    if (service) {
      const companiesWithService = await db('goods_services')
        .where('name', 'ilike', `%${service}%`)
        .select('company_id');
      
      companyIds = companiesWithService.map(c => c.company_id);
      if (companyIds.length > 0) {
        query = query.whereIn('companies.id', companyIds);
      } else {
        // If no companies have this service, return empty result
        return res.json({
          companies: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
          }
        });
      }
    }

    // Get total count for pagination
    const countQuery = db('companies');
    
    // Apply the same filters to count query
    if (name) {
      countQuery.where('companies.name', 'ilike', `%${name}%`);
    }
    if (industry) {
      countQuery.where('companies.industry', 'ilike', `%${industry}%`);
    }
    if (service && companyIds) {
      countQuery.whereIn('companies.id', companyIds);
    }
    
    const totalCount = await countQuery.count('* as total').first();

    // Apply pagination and ordering
    const companies = await query
      .orderBy('companies.name', 'asc')
      .limit(parseInt(limit))
      .offset(offset);

    // For each company, get their goods/services
    const companiesWithServices = await Promise.all(
      companies.map(async (company) => {
        const services = await db('goods_services')
          .where({ company_id: company.id })
          .select('id', 'name', 'description');
        
        return {
          ...company,
          services: services
        };
      })
    );

    res.json({
      companies: companiesWithServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.total),
        totalPages: Math.ceil(parseInt(totalCount.total) / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /search/all-companies - Get all companies without pagination (for companies listing page)
router.get('/all-companies', async (req, res) => {
  try {
    const companies = await db('companies')
      .select(
        'companies.id',
        'companies.name',
        'companies.industry',
        'companies.description',
        'companies.logo_url',
        'companies.created_at'
      )
      .orderBy('companies.name', 'asc');

    // For each company, get their goods/services
    const companiesWithServices = await Promise.all(
      companies.map(async (company) => {
        const services = await db('goods_services')
          .where({ company_id: company.id })
          .select('id', 'name', 'description');
        
        return {
          ...company,
          services: services
        };
      })
    );

    res.json(companiesWithServices);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /search/companies/:id - Get detailed company information
router.get('/companies/:id', async (req, res) => {
  try {
    const company = await db('companies')
      .where({ id: req.params.id })
      .first();

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get company's goods/services
    const services = await db('goods_services')
      .where({ company_id: company.id })
      .select('id', 'name', 'description');

    // Get company's tenders
    const tenders = await db('tenders')
      .where({ company_id: company.id })
      .select('id', 'title', 'description', 'deadline', 'budget', 'created_at')
      .orderBy('created_at', 'desc');

    res.json({
      ...company,
      services: services,
      tenders: tenders
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /search/industries - Get all unique industries
router.get('/industries', async (req, res) => {
  try {
    const industries = await db('companies')
      .distinct('industry')
      .whereNotNull('industry')
      .orderBy('industry', 'asc');

    res.json(industries.map(item => item.industry));
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /search/services - Get all unique services
router.get('/services', async (req, res) => {
  try {
    const services = await db('goods_services')
      .distinct('name')
      .orderBy('name', 'asc');

    res.json(services.map(item => item.name));
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 