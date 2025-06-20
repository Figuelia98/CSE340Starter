const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities")
const inventoryValidate = require('../utilities/inventory-validation');
// Route to build inventory by classification view
router.get("/type/:classificationId",utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:invId",utilities.handleErrors(invController.buildItemById) );
module.exports = router;