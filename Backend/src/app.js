const express = require('express');
const db = require('./db');
const cors = require('cors');
const authRouter = require('./routes/auth');
const companiesRouter = require('./routes/companies');
const tendersRouter = require('./routes/tenders');
const applicationsRouter = require('./routes/applications');
const searchRouter = require('./routes/search');
const { authenticateJWT } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('TenderConnect API');
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await db.raw('SELECT 1+1 AS result');
    res.json({ dbTest: result.rows ? result.rows[0].result : result[0].result });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

app.use('/auth', authRouter);
app.use('/companies', companiesRouter);
app.use('/tenders', tendersRouter);
app.use('/applications', applicationsRouter);
app.use('/search', searchRouter);

module.exports = app; 