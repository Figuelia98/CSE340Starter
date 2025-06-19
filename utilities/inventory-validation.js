const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  /*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */
validate.inventoryDataRules = () => {
  return [
    // Make is required and must be string
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Make."),

    // Model is required and must be string
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Model."),

    // Year is required and must be a valid 4-digit year
    body("inv_year")
      .notEmpty()
      .withMessage("Please provide a Year.")
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid Year."),

    // Description is required and must be string
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Description."),

    // Image is required and must be a valid URL
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an Image PATH.")
      .matches(/^(https?:\/\/.*|\/?.*?)\.(jpg|jpeg|png|gif)$/i)
      .withMessage("Image must be a valid PATH."),

    // Thumbnail is required and must be a valid URL
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a Thumbnail PATH.")
      .matches(/^(https?:\/\/.*|\/?.*?)\.(jpg|jpeg|png|gif)$/i)
      .withMessage("Thumbnail must be a valid PATH."),

    // Price is required and must be a decimal number
    body("inv_price")
      .notEmpty()
      .withMessage("Please provide a Price.")
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),

    // Miles is required and must be an integer >= 0
    body("inv_miles")
      .notEmpty()
      .withMessage("Please provide Mileage.")
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative integer."),

    // classification_id is required and must be an integer >= 0
    body("classification_id")
      .notEmpty()
      .withMessage("Please provide Classification_id.")
      .isInt({ min: 0 })
      .withMessage("Classification Id must be a non-negative integer."),

    // Color is required and must be string
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a Color."),
  ];
};

  /* ******************************
 * Check data and return errors or continue to adding
 * ***************************** */
validate.checkRegInventoryData = async (req, res, next) => {
  const {inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log("Error: "+errors);
    let nav = await utilities.getNav()
    let selection = await utilities.getSelectClassification()
    res.render("management/inventory", {
      errors,
      title: "Inventory",
      nav,
      selection,
      inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id 
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to updating
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {inv_id, inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.getSelectClassification()
    res.render("../inventory/edit-inventory", {
      errors,
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      inv_id,inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id 
    })
    return
  }
  next()
}

module.exports = validate