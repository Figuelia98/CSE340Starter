const express = require("express");
const router = new express.Router();
const managementController = require("../controllers/managementController");
const utilities = require("../utilities")
const regValidate = require('../utilities/inventory-validation')
const regValidateClass = require('../utilities/classification-validation')
// Route to build inventory by classification view
router.get("/",utilities.handleErrors(managementController.buildMangement));
router.get("/addclassification",utilities.handleErrors(managementController.buildClassification) );
router.get("/addinventory",utilities.handleErrors(managementController.buildInventory) );
router.post("/addclassification",regValidateClass.classificationDataRules(),regValidateClass.checkRegClassificationData,utilities.handleErrors(managementController.addClassification) );
router.post("/addinventory",regValidate.inventoryDataRules(),regValidate.checkRegInventoryData, utilities.handleErrors(managementController.addInventory) );
module.exports = router;