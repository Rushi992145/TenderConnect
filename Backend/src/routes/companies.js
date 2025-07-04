const express = require('express');
const db = require('../db');
const Joi = require('joi');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

const companySchema = Joi.object({
  name: Joi.string().required(),
  industry: Joi.string().required(),
  description: Joi.string().allow(''),
  logo_url: Joi.string().uri().allow(''),
});

// Create company profile
router.post('/', authenticateJWT, async (req, res) => {
  const { error, value } = companySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const [company] = await db('companies')
      .insert({ ...value, user_id: req.user.id })
      .returning(['id', 'name', 'industry', 'description', 'logo_url', 'created_at']);
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get own company profile
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update own company profile
router.put('/me', authenticateJWT, async (req, res) => {
  const { error, value } = companySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const updated = await db('companies')
      .where({ user_id: req.user.id })
      .update(value)
      .returning(['id', 'name', 'industry', 'description', 'logo_url', 'created_at']);
    if (!updated.length) return res.status(404).json({ error: 'Company not found' });
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete own company profile
router.delete('/me', authenticateJWT, async (req, res) => {
  try {
    const deleted = await db('companies').where({ user_id: req.user.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Company not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 