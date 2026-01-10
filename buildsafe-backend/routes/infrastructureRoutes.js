// routes/infrastructureRoutes.js
const express = require('express');
const router = express.Router();
const infraController = require('../controllers/infrastructureController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', infraController.createInfrastructure);
router.get('/', infraController.getInfrastructures);
router.get('/:id', infraController.getInfrastructure);

module.exports = router;