const express = require('express');

const auth = require('../middleware/auth');
const {
  createSurvey,
  listMySurveys,
} = require('../controllers/surveyController');
const {
  publishSurvey,
  closeSurvey,
} = require('../controllers/surveyLifecycleController');

const {
  getSurveyStatistics,
} = require('../controllers/statisticsController');

const router = express.Router();

router.use(auth);

router
  .route('/')
  .post(createSurvey)
  .get(listMySurveys);

router.get(
  '/:surveyId/statistics',
  getSurveyStatistics
);
router.post('/:surveyId/publish', publishSurvey);
router.post('/:surveyId/close', closeSurvey);


module.exports = router;