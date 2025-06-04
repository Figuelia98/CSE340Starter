const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}
/* ***************************
 *  Build Error case
 * ************************** */
baseController.buildErrorCase= async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./caseissues", {
    title: "New Case",
    nav,
  })
};

module.exports = baseController