const express = require('express');
const db = require('../db');
const Joi = require('joi');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

const tenderSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  deadline: Joi.date().required(),
  budget: Joi.number().precision(2).min(0),
});

// Create a new tender
router.post('/', authenticateJWT, async (req, res) => {
  const { error, value } = tenderSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    // Find the company for the user
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const [tender] = await db('tenders')
      .insert({ ...value, company_id: company.id })
      .returning(['id', 'title', 'description', 'deadline', 'budget', 'created_at']);
    res.status(201).json(tender);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all tenders (paginated)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const tenders = await db('tenders')
      .select(
        'tenders.id',
        'tenders.company_id',
        'tenders.title',
        'tenders.description',
        'tenders.deadline',
        'tenders.budget',
        'tenders.created_at',
        'companies.name as company_name',
        'companies.industry as company_industry'
      )
      .join('companies', 'tenders.company_id', 'companies.id')
      .orderBy('tenders.created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    // Get applications count for each tender
    const tendersWithApplications = await Promise.all(
      tenders.map(async (tender) => {
        const applicationsCount = await db('applications')
          .where({ tender_id: tender.id })
          .count('* as count')
          .first();
        return {
          ...tender,
          applications_count: parseInt(applicationsCount.count)
        };
      })
    );
    
    res.json({ page, limit, tenders: tendersWithApplications });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all tenders for the authenticated user's company
router.get('/my', authenticateJWT, async (req, res) => {
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const tenders = await db('tenders')
      .where({ company_id: company.id })
      .select('id', 'title', 'description', 'deadline', 'budget', 'created_at')
      .orderBy('created_at', 'desc');
    
    // Get applications count for each tender
    const tendersWithApplications = await Promise.all(
      tenders.map(async (tender) => {
        const applicationsCount = await db('applications')
          .where({ tender_id: tender.id })
          .count('* as count')
          .first();
        return {
          ...tender,
          applications_count: parseInt(applicationsCount.count)
        };
      })
    );
    
    res.json(tendersWithApplications);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get a single tender by id
router.get('/:id', async (req, res) => {
  try {
    const tender = await db('tenders').where({ id: req.params.id }).first();
    if (!tender) return res.status(404).json({ error: 'Tender not found' });
    res.json(tender);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update a tender (only by the owning company)
router.put('/:id', authenticateJWT, async (req, res) => {
  const { error, value } = tenderSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const updated = await db('tenders')
      .where({ id: req.params.id, company_id: company.id })
      .update(value)
      .returning(['id', 'title', 'description', 'deadline', 'budget', 'created_at']);
    if (!updated.length) return res.status(404).json({ error: 'Tender not found or not owned by your company' });
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a tender (only by the owning company)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const deleted = await db('tenders')
      .where({ id: req.params.id, company_id: company.id })
      .del();
    if (!deleted) return res.status(404).json({ error: 'Tender not found or not owned by your company' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 