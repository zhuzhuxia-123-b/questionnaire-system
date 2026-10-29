const express = require('express');

const auth = require('../middleware/auth');

const {
  createQuestionItem,
  listMyQuestionItems,
  getQuestionItem,
  createQuestionItemVersion,
  listQuestionItemVersions,
  restoreQuestionItemVersion,
} = require(
  '../controllers/questionItemController'
);

const {
  getQuestionItemUsage,
} = require(
  '../controllers/questionUsageController'
);

const {
  getCrossSurveyStatistics,
} = require(
  '../controllers/crossSurveyStatisticsController'
);

const {
  shareQuestionItem,
  listQuestionItemShares,
  revokeQuestionShare,
  listReceivedQuestionItems,
  listReceivedQuestionVersions,
} = require(
  '../controllers/questionShareController'
);

const router = express.Router();

router.use(auth);

router.get(
  '/received-shares',
  listReceivedQuestionItems
);

router.get(
  '/received-shares/:questionItemId/versions',
  listReceivedQuestionVersions
);

router
  .route('/')
  .post(createQuestionItem)
  .get(listMyQuestionItems);

router
  .route('/:questionItemId/shares')
  .post(shareQuestionItem)
  .get(listQuestionItemShares);

router.delete(
  '/:questionItemId/shares/:shareId',
  revokeQuestionShare
);

router
  .route('/:questionItemId/versions')
  .post(createQuestionItemVersion)
  .get(listQuestionItemVersions);

router.post(
  '/:questionItemId/versions/:versionId/restore',
  restoreQuestionItemVersion
);

router.get(
  '/:questionItemId/usage',
  getQuestionItemUsage
);

router.get(
  '/:questionItemId/cross-survey-statistics',
  getCrossSurveyStatistics
);

router.get(
  '/:questionItemId',
  getQuestionItem
);

module.exports = router;