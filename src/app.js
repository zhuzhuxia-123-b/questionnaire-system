const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require(
  './routes/authRoutes'
);
const surveyRoutes = require(
  './routes/surveyRoutes'
);
const questionRoutes = require(
  './routes/questionRoutes'
);
const publicSurveyRoutes = require(
  './routes/publicSurveyRoutes'
);
const questionItemRoutes = require(
  './routes/questionItemRoutes'
);
const questionBankRoutes = require(
  './routes/questionBankRoutes'
);

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
    message:
      'Questionnaire API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/surveys', questionRoutes);
app.use('/api/public', publicSurveyRoutes);

app.use(
  '/api/question-items',
  questionItemRoutes
);

app.use(
  '/api/question-banks',
  questionBankRoutes
);

app.use((req, res) => {
  res.status(404).json({
    message: '接口不存在',
  });
});

app.use((error, req, res, next) => {
  if (
    error?.type ===
    'entity.parse.failed'
  ) {
    return res.status(400).json({
      message:
        '请求体必须是有效的 JSON',
    });
  }

  console.error(error);

  return res.status(500).json({
    message: '服务器内部错误',
  });
});

module.exports = app;