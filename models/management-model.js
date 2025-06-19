const pool = require("../database/")

/* *****************************
*  Add new classification
* *************************** */
async function addClassification(classification_name){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}
/* *****************************
*  Add new Vehicle
* *************************** */
async function addVehicle(inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id){
  try {
    const sql = "INSERT INTO inventory (inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *"
    return await pool.query(sql, [inv_make,inv_model,inv_year,inv_description, inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id])
  } catch (error) {
    return error.message
  }
}

module.exports={ addClassification, addVehicle};