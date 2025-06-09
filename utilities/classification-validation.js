const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  /*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */
validate.classificationDataRules = () => {
  return [
    // Make is required and must be string
    body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a classification name")
        .matches(/^[^\s]+$/)
        .withMessage("Classification name must not contain spaces"),

  ];
};

  /* ******************************
 * Check data and return errors or continue to adding
 * ***************************** */
validate.checkRegClassificationData = async (req, res, next) => {
  const {classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    for(err in errors){
        console.log("Error: "+err);
    }
    
    let nav = await utilities.getNav()
    res.render("management/classification", {
      errors,
      title: "Classification",
      nav,
      classification_name,
      
    })
    return
  }
  next()
}

module.exports = validate