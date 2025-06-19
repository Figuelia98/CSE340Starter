const express = require('express');
const baseController = require('../controllers/baseController');
const router = express.Router();
const utilities = require("../utilities");


router.get('/',utilities.handleErrors(baseController.buildHome))
router.get('/newlink',utilities.handleErrors(baseController.buildErrorCase))

module.exports = router;

