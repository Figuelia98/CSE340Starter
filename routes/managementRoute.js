const express = require("express");
const router = new express.Router();
const managementController = require("../controllers/managementController");
const utilities = require("../utilities")
const regValidate = require('../utilities/inventory-validation')
const regValidateClass = require('../utilities/classification-validation')
// Route to build inventory by classification view
router.get("/management",utilities.handleErrors(managementController.buildMangement));
router.get("/classification",utilities.handleErrors(managementController.buildClassification) );
router.get("/inventory",utilities.handleErrors(managementController.buildInventory) );
router.post("/classification",regValidateClass.classificationDataRules(),regValidateClass.checkRegClassificationData,utilities.handleErrors(managementController.addClassification) );
router.post("/inventory",regValidate.inventoryDataRules(),regValidate.checkRegInventoryData, utilities.handleErrors(managementController.addInventory) );
module.exports = router;