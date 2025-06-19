const express = require("express");
const router = new express.Router();
const managementController = require("../controllers/managementController");
const utilities = require("../utilities")
const regValidate = require('../utilities/inventory-validation')
const regValidateClass = require('../utilities/classification-validation')
const inventoryValidate = require('../utilities/inventory-validation');
// Route to build inventory by classification view
router.get("/",utilities.handleErrors(managementController.buildMangement));
router.get("/addclassification",utilities.handleErrors(managementController.buildClassification) );
router.get("/addinventory",utilities.handleErrors(managementController.buildInventory) );
router.post("/addclassification",regValidateClass.classificationDataRules(),regValidateClass.checkRegClassificationData,utilities.handleErrors(managementController.addClassification) );
router.post("/addinventory",regValidate.inventoryDataRules(),regValidate.checkRegInventoryData, utilities.handleErrors(managementController.addInventory) );
router.get("/management", utilities.checkEmployeeOrAdmin, utilities.handleErrors(managementController.buildManagementView));
router.get("/getInventory/:classification_id", utilities.handleErrors(managementController.getInventoryJSON));
// Route to build edit inventory view
router.get("/udpinventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(managementController.editInventoryView));
// Route to handle inventory update
router.post("/udpinventory", utilities.checkEmployeeOrAdmin, inventoryValidate.inventoryDataRules(), inventoryValidate.checkUpdateData, utilities.handleErrors(managementController.updateInventory));
// Route to delete inventory item
router.get("/deleteinventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(managementController.delInventoryView));
router.post("/deleteinventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(managementController.processDeleteInventory));
module.exports = router;