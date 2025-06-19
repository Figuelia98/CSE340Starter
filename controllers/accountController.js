const utilities = require("../utilities/");
const accountModel = require("../models/account_model")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');


require("dotenv").config()
/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}
/* ****************************************
*  Deliver logged
* *************************************** */
async function buildLogged(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/", {
    title: "My account",
    nav,
    errors: null,
  })
}
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}



/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  console.log(JSON.stringify(req.body));

  // Hash the password before saving
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  } catch (err) {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  console.log("Data: "+JSON.stringify(accountData));
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    // Compare hashed password
    const match = await bcrypt.compare(account_password, accountData.account_password);
    if (match) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.flash("notice", "You are logged in")
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.log("Data error: "+JSON.stringify(error));
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Logout
 * ************************************ */
async function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

/* ****************************************
*  Render user information view
* *************************************** */
async function renderUserInfoView(req, res, next) {
  let nav = await utilities.getNav();
  // Assuming user info is stored in req.user or req.session.account
  res.render("management/user-information", {
    title: "User Information",
    nav,
    notice: req.flash("notice"),
    errors: null,
  });
}

/* ****************************************
*  Process update user information
* *************************************** */
async function processUpdateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email, account_password } = req.body;
  try {
    let hashedPassword = null;
    if (account_password && account_password.trim() !== "") {
      hashedPassword = await bcrypt.hash(account_password, 10);
    }
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );
    console.log("Result: "+JSON.stringify(updateResult))
    if (updateResult) {
      req.flash("notice", "Your information was successfully updated.");
      // Optionally update session or req.user here
      res.redirect("/");
    } else {
      req.flash("notice", "Sorry, the update failed.");
      res.status(501).render("management/user-information", {
        title: "User Information",
        nav,
        account: req.body,
        notice: req.flash("notice"),
        errors: null,
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred while updating your information.");
    res.status(500).render("management/user-information", {
      title: "User Information",
      nav,
      account: req.body,
      notice: req.flash("notice"),
      errors: null,
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildLogged, logout, renderUserInfoView, processUpdateAccount };