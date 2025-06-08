const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}
  /* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildItemById= async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id)
  const section = await utilities.buildItem(data)
  let nav = await utilities.getNav()
  const className = data[0].inv_year+" "+data[0].inv_make+" "+data[0].inv_model
  res.render("./inventory/detail", {
    title: className + " vehicles",
    nav,
    section,
    errors: null,
  })
};



module.exports = invCont;