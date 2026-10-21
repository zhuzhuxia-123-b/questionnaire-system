const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const questionRoutes = require('./routes/questionRoutes');
const publicSurveyRoutes =
  require('./routes/publicSurveyRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  express.static(
    path.join(__dirname, '..', 'public')
  )
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Questionnaire API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/surveys', questionRoutes);
app.use('/api/public', publicSurveyRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: '接口不存在',
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: '服务器内部错误',
  });
});

module.exports = app;