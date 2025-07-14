require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const specRoutes = require('./routes/specs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', specRoutes);

app.get('/', (req, res) => {
  res.send('Spec Driven API is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
