const invModel = require("../models/inventory-model")
const Util = {}

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

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
module.exports = Util