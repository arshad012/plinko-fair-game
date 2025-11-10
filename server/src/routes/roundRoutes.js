const express = require('express');
const router = express.Router();
const controller = require('../controllers/roundController.js');

router.post('/commit', controller.commitRound);
router.post('/:id/start', controller.startRound);
router.post('/:id/reveal', controller.revealRound);
router.get('/:id', controller.getRound);
router.get('/', controller.listRounds);

module.exports = router;
