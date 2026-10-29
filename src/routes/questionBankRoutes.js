const express = require('express');

const auth = require('../middleware/auth');

const {
  createQuestionBank,
  listMyQuestionBanks,
  getQuestionBank,
  updateQuestionBank,
  addQuestionItemToBank,
  removeQuestionItemFromBank,
  setPreferredQuestionVersion,
  addBankQuestionToSurvey,
} = require(
  '../controllers/questionBankController'
);

const router = express.Router();

router.use(auth);

router
  .route('/')
  .post(createQuestionBank)
  .get(listMyQuestionBanks);

router.post(
  '/:bankId/items',
  addQuestionItemToBank
);

router.patch(
  '/:bankId/items/:questionItemId/preferred-version',
  setPreferredQuestionVersion
);

router.post(
  '/:bankId/items/:questionItemId/add-to-survey',
  addBankQuestionToSurvey
);

router.delete(
  '/:bankId/items/:questionItemId',
  removeQuestionItemFromBank
);

router
  .route('/:bankId')
  .get(getQuestionBank)
  .patch(updateQuestionBank);

module.exports = router;