const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()
/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ************************
 * Constructs the select HTML 
 ************************** */
Util.getSelectClassification = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<select name='classification_id' required>"
  list += '<option value="">Select Classification</option>'
  data.rows.forEach((row) => {
    list += `<option id="${row.classification_id }" value="${row.classification_id }">${row.classification_name}</option>`
  })
  list += "</select>"
  return list
}
Util.getSelectInventory = async function (req, res, next) {
  let data = await invModel.getInventory()
  let list = "<select name='inv_id' required>"
  list += '<option value="">Select Inventory</option>'
  data.rows.forEach((row) => {
    list += `<option id="${row.inv_id }" value="${row.inv_id }">${row.inv_make} ${row.inv_model}</option>`
  })
  list += "</select>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the Item view HTML
* ************************************ */
Util.buildItem = async function(data){
  let container
  if(data.length > 0){
    container = '<section id="inv-item">'
    data.forEach(vehicle => {      
      container += '<div class="grid-contenair" >'
      container += '<div class="grid" >'
      container += '<img src="' + vehicle.inv_image
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" />'
      container += '</div>'
      container += '<div class="grid" >'
      container += '<h2>'+vehicle.inv_make+' '+vehicle.inv_model+'</h2>'
      container += '<p class="stylus"><b>Price:</b><span>$'+new Intl.NumberFormat('en-US').format(vehicle.inv_price)+'</span></p>'
      container += '<p class="desc"><b>Description: </b>'+vehicle.inv_description+'</p>'
      container += '<p class="stylus"><b>Color: </b>'+vehicle.inv_color+'</p>'
      container += '<p class="stylus"><b>Miles: </b>'+vehicle.inv_miles+'</p>'
      container += '</div>'
      container += '</div>'
    })
    container += '</section>'
  } else { 
    container += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return container
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}
/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Check Employee or Admin
 * ************************************ */
Util.checkEmployeeOrAdmin = (req, res, next) => {
  if (
    res.locals.loggedin &&
    res.locals.accountData &&
    (res.locals.accountData.account_type === 'Employee' || res.locals.accountData.account_type === 'Admin')
  ) {
    next();
  } else {
    req.flash("notice", "You must be logged in as an Employee or Admin to access this page.");
    return res.redirect("/account/login");
  }
};

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
* Build inventory items into HTML table components
* ************************************ */
Util.buildInventoryTable = function(data) {
  // Set up the table labels
  let dataTable = '<thead>';
  dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
  dataTable += '</thead>';
  // Set up the table body
  dataTable += '<tbody>';
  // Iterate over all vehicles in the array and put each in a row
  data.forEach(function (element) {
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
  })
  dataTable += '</tbody>';
  return dataTable;
}

/* **************************************
* Return JS code for dynamic inventory table
* ************************************ */
Util.getInventoryManagementScript = function() {
  return `
    (function(){
      let classificationList = document.querySelector("#classificationList");
      function buildInventoryList(data) {
        let inventoryDisplay = document.getElementById("inventoryDisplay");
        let dataTable = '<thead>';
        dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
        dataTable += '</thead>';
        dataTable += '<tbody>';
        data.forEach(function (element) {
          dataTable += '<tr><td>' + element.inv_make + ' ' + element.inv_model + '</td>';
          dataTable += "<td><a href='/inv/edit/" + element.inv_id + "' title='Click to update'>Modify</a></td>";
          dataTable += "<td><a href='/inv/delete/" + element.inv_id + "' title='Click to delete'>Delete</a></td></tr>";
        });
        dataTable += '</tbody>';
        inventoryDisplay.innerHTML = dataTable;
      }
      if (classificationList) {
        classificationList.addEventListener("change", function () {
          let classification_id = classificationList.value;
          let classIdURL = "/inv/getInventory/" + classification_id;
          fetch(classIdURL)
            .then(function (response) {
              if (response.ok) {
                return response.json();
              }
              throw Error("Network response was not OK");
            })
            .then(function (data) {
              buildInventoryList(data);
            })
            .catch(function (error) {
              console.log('There was a problem: ', error.message);
            });
        });
      }
    })();
  `;
}

module.exports = Util;