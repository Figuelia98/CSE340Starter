const utilities = require("../utilities/");
const managementModel = require("../models/management-model");


/* ****************************************
*   Management view
* *************************************** */
async function buildMangement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("management/management", {
    title: "Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*   Inventory view
* *************************************** */
async function buildInventory(req, res, next) {
  let nav = await utilities.getNav()
  let selection= await utilities.getSelectClassification();
  console.log(selection);
  res.render("management/inventory", {
    title: "Inventory",
    nav,
    selection,
    errors: null,
  })
}

/* ****************************************
*   Classification view
* *************************************** */
async function buildClassification(req, res, next) {
  let nav = await utilities.getNav()
  res.render("management/classification", {
    title: "Classification",
    nav,
    errors: null,
  })
}





/* ****************************************
*  Process Add classification
* *************************************** */
async function addClassification(req, res) {
  let nav = await utilities.getNav()
  const {classification_name} = req.body
  console.log(JSON.stringify(req.body));

  const regResult = await managementModel.addClassification(classification_name)
  if (typeof regResult !== 'string') {
    req.flash(
      "notice",
      `New Classification: ${classification_name} successfully added`
    )
    res.status(201).render("management/management", {
      title: "Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, adding new classfication failed.")
    res.status(501).render("management/classification", {
      title: "Add classification",
      nav,
    })
  }
}

/* ****************************************
*  Process Add Inventory
* *************************************** */
async function addInventory(req, res) {
  let nav = await utilities.getNav()
  const {inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id} = req.body
  console.log(JSON.stringify(req.body));

  const regResult = await managementModel.addVehicle(inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id);
   console.log(regResult);
  if (typeof regResult !== 'string') {
    
    req.flash(
      "notice",
      `New vehicle: ${inv_make} successfully added`
    )
    res.status(201).render("management/management", {
      title: "Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, adding new classfication failed.")
    res.status(501).render("management/inventory", {
      title: "Add Vehicle",
      nav,
    })
  }
}

module.exports ={buildClassification,buildMangement,buildInventory,addClassification,addInventory};