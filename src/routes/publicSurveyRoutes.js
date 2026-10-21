const express = require('express');

const auth = require('../middleware/auth');
const {
  getPublicSurvey,
} = require('../controllers/surveyLifecycleController');
const {
  submitResponse,
} = require('../controllers/responseController');

const router = express.Router();

router.get('/surveys/:publicId', getPublicSurvey);

router.post(
  '/surveys/:publicId/responses',
  auth,
  submitResponse
);

module.exports = router;