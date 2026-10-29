const express = require('express');

const auth = require('../middleware/auth');

const {
  createQuestion,
  listQuestions,
  updateQuestion,
  deleteQuestion,
  updateJumpRules,
} = require(
  '../controllers/questionController'
);

const {
  createQuestionFromLibrary,
} = require(
  '../controllers/questionReuseController'
);

const router = express.Router();

router.use(auth);

router
  .route('/:surveyId/questions')
  .post(createQuestion)
  .get(listQuestions);

router.post(
  '/:surveyId/questions/from-library',
  createQuestionFromLibrary
);

router
  .route('/:surveyId/questions/:questionId')
  .patch(updateQuestion)
  .delete(deleteQuestion);

router.put(
  '/:surveyId/questions/:questionId/jump-rules',
  updateJumpRules
);

module.exports = router;