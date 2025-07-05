const express = require('express');
const db = require('../db');
const Joi = require('joi');
const { authenticateJWT } = require('../middleware/auth');
const { uploadImageToSupabase } = require('../supabase');

const router = express.Router();

const companySchema = Joi.object({
  name: Joi.string().required(),
  industry: Joi.string().required(),
  description: Joi.string().optional(),
  logo_url: Joi.string().optional().allow(''),
});

const goodsServiceSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

// Register a new company
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { error, value } = companySchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Check if user already has a company
    const existing = await db('companies').where({ user_id: req.user.id }).first();
    if (existing) {
      return res.status(409).json({ error: 'User already has a company registered' });
    }
    
    let logoUrl = value.logo_url || null;
    
    // If logo_url is base64 data, upload to Supabase
    if (logoUrl && logoUrl.startsWith('data:image/')) {
      try {
        console.log('Uploading logo to Supabase...');
        logoUrl = await uploadImageToSupabase(logoUrl, `${value.name}_logo`);
        console.log('Logo uploaded successfully:', logoUrl);
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        return res.status(500).json({ error: 'Failed to upload logo image' });
      }
    }
    
    // Prepare company data
    const companyData = {
      name: value.name,
      industry: value.industry,
      description: value.description,
      logo_url: logoUrl,
      user_id: req.user.id
    };
    
    console.log('Inserting company data:', { ...companyData, logo_url: companyData.logo_url ? '[SUPABASE_URL]' : null });
    
    const [company] = await db('companies')
      .insert(companyData)
      .returning(['id', 'name', 'industry', 'description', 'logo_url', 'created_at']);
    
    console.log('Company created successfully:', company.id);
    res.status(201).json(company);
  } catch (err) {
    console.error('Company registration error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get company profile
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    // Get company's goods/services
    const services = await db('goods_services')
      .where({ company_id: company.id })
      .select('id', 'name', 'description');
    
    res.json({
      ...company,
      services: services
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update company profile
router.put('/profile', authenticateJWT, async (req, res) => {
  try {
    const { error, value } = companySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    let logoUrl = value.logo_url || null;
    
    // If logo_url is base64 data, upload to Supabase
    if (logoUrl && logoUrl.startsWith('data:image/')) {
      try {
        console.log('Uploading updated logo to Supabase...');
        logoUrl = await uploadImageToSupabase(logoUrl, `${value.name}_logo`);
        console.log('Updated logo uploaded successfully:', logoUrl);
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        return res.status(500).json({ error: 'Failed to upload logo image' });
      }
    }
    
    const updateData = {
      name: value.name,
      industry: value.industry,
      description: value.description,
      logo_url: logoUrl
    };
    
    const updated = await db('companies')
      .where({ user_id: req.user.id })
      .update(updateData)
      .returning(['id', 'name', 'industry', 'description', 'logo_url', 'created_at']);
    
    if (!updated.length) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(updated[0]);
  } catch (err) {
    console.error('Company update error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Add goods/service to company
router.post('/goods-services', authenticateJWT, async (req, res) => {
  const { error, value } = goodsServiceSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    const [service] = await db('goods_services')
      .insert({ ...value, company_id: company.id })
      .returning(['id', 'name', 'description', 'company_id']);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update goods/service
router.put('/goods-services/:id', authenticateJWT, async (req, res) => {
  const { error, value } = goodsServiceSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    const updated = await db('goods_services')
      .where({ id: req.params.id, company_id: company.id })
      .update(value)
      .returning(['id', 'name', 'description', 'company_id']);
    if (!updated.length) return res.status(404).json({ error: 'Goods/service not found' });
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete goods/service
router.delete('/goods-services/:id', authenticateJWT, async (req, res) => {
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    const deleted = await db('goods_services')
      .where({ id: req.params.id, company_id: company.id })
      .del();
    if (!deleted) return res.status(404).json({ error: 'Goods/service not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all goods/services for company
router.get('/goods-services', authenticateJWT, async (req, res) => {
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    const services = await db('goods_services')
      .where({ company_id: company.id })
      .select('id', 'name', 'description')
      .orderBy('name', 'asc');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 