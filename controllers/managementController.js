const invModel = require("../models/inventory-model");
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



/* ***************************
 *  Build inventory management view
 * ************************** */
const buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  // Build the classification select list
  const classificationSelect = await utilities.getSelectClassification();
  const inventoryScript = `<script>${utilities.getInventoryManagementScript()}</script>`;
  res.render("./management/management", {
    title: "Management",
    nav,
    classificationSelect,
    inventoryScript,
    errors: null,
  });
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
const getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData && invData[0] && invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
const editInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav();
  // Use a utility to build the classification select list, pre-selecting the current classification
  const classificationSelect = await utilities.getSelectClassification();
  const selectionInventory = await utilities.getSelectInventory();
  res.render("./management/update-inventory", {
    title: "Update Inventory ",
    nav,
    classificationSelect,
    selectionInventory,
    errors: null,
  });
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
const delInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const selectionInventory = await utilities.getSelectInventory();
  res.render("./management/delete-inventory", {
    title: "Delete Inventory ",
    nav,
    selectionInventory,
    errors: null,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
const updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/management")
  } else {
    const classificationSelect = await utilities.getSelectClassification()
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("./management/update-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Process Delete Inventory
 * ************************** */
const processDeleteInventory = async function (req, res, next) {
  const {inv_id} = parseInt(req.params.body);
  try {
    const deleteResult = await invModel.deleteInventory(inv_id);
    if (deleteResult) {
      req.flash("notice", `The inventory item was successfully deleted.`);
      res.redirect("/inv/management");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      res.status(501).redirect("/inv/management");
    }
  } catch (error) {
    req.flash("notice", "An error occurred while deleting the inventory item.");
    res.status(500).redirect("/inv/management");
  }
};

module.exports ={delInventoryView,updateInventory,buildManagementView,getInventoryJSON,editInventoryView,buildClassification,buildMangement,buildInventory,addClassification,addInventory, processDeleteInventory};