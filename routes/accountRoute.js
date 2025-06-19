const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/login",utilities.handleErrors(accountController.buildLogin));
router.get("/",utilities.handleErrors(accountController.buildLogged));
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);
router.get("/register",utilities.handleErrors(accountController.buildRegister));
router.post("/register",
    regValidate.registationRules(),
    regValidate.checkRegData,utilities.handleErrors(accountController.registerAccount));
router.get("/logout", utilities.handleErrors(accountController.logout));
router.get("/personalinfo",utilities.handleErrors(accountController.renderUserInfoView));
router.post("/personalinfo",utilities.handleErrors(accountController.processUpdateAccount));
module.exports = router;