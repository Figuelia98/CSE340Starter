const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}
/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
*   Update account information
* *************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email, account_password = null) {
  try {
    let sql, params;
    if (account_password) {
      sql = `UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3, account_password = $4 WHERE account_id = $5 RETURNING *`;
      params = [account_firstname, account_lastname, account_email, account_password, account_id];
    } else {
      sql = `UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *`;
      params = [account_firstname, account_lastname, account_email, account_id];
    }
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    return error.message;
  }
}

module.exports = {registerAccount, getAccountByEmail, updateAccount};