const express = require('express');
const db = require('../db');
const Joi = require('joi');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

const applicationSchema = Joi.object({
  proposal_text: Joi.string().required(),
});

// Submit a proposal to a tender
router.post('/:tenderId', authenticateJWT, async (req, res) => {
  const { error, value } = applicationSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    // Prevent duplicate applications
    const existing = await db('applications').where({ tender_id: req.params.tenderId, company_id: company.id }).first();
    if (existing) return res.status(409).json({ error: 'Already applied to this tender' });
    const [application] = await db('applications')
      .insert({ tender_id: req.params.tenderId, company_id: company.id, proposal_text: value.proposal_text })
      .returning(['id', 'tender_id', 'company_id', 'proposal_text', 'created_at']);
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all applications for a tender (for the tender owner)
router.get('/tender/:tenderId', authenticateJWT, async (req, res) => {
  try {
    // Check if the user owns the tender
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const tender = await db('tenders').where({ id: req.params.tenderId, company_id: company.id }).first();
    if (!tender) return res.status(403).json({ error: 'Not authorized to view applications for this tender' });
    const applications = await db('applications')
      .where({ 'applications.tender_id': req.params.tenderId })
      .join('companies', 'applications.company_id', 'companies.id')
      .select(
        'applications.id',
        'applications.company_id',
        'applications.proposal_text',
        'applications.created_at',
        'companies.name as company_name',
        'companies.industry as company_industry'
      );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all applications submitted by the authenticated user's company
router.get('/my', authenticateJWT, async (req, res) => {
  try {
    const company = await db('companies').where({ user_id: req.user.id }).first();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const applications = await db('applications')
      .where({ 'applications.company_id': company.id })
      .join('tenders', 'applications.tender_id', 'tenders.id')
      .select(
        'applications.id',
        'applications.tender_id',
        'applications.proposal_text',
        'applications.created_at',
        'tenders.title as tender_title',
        'tenders.description as tender_description',
        'tenders.deadline as tender_deadline',
        'tenders.budget as tender_budget'
      );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 