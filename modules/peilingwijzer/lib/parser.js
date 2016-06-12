/*
 * @package charli
 * @subpackage peilingwijzer
 * @copyright Copyright(c) 2016 Paranoia Watch
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 */

var getFile = require('./file')

function main (fileData) {
  var fieldNames = parseFieldNamesFromFileData(fileData)
  var rowsData = parseDataRowsFromFileData(fileData)
  var data = parseObjectFromRowsDataAndFieldNames(rowsData, fieldNames)
  return data
}

function parseFieldNamesFromFileData (fileData) {
  var headerRowData = fileData.split(/\n/g)[0]
  headerRowFields = headerRowData.split(',').slice(this.length).map(function(headerRowFieldName) {
    return headerRowFieldName.replace(/\r/g, "")
  })
  return headerRowFields
}

function parseDataRowsFromFileData (fileData) {
  return fileData.split(/\n/g).slice(1, -1)
}

function parseObjectFromRowsDataAndFieldNames (rowsData, fieldNames) {
  return rowsData.map(function (rowData) {
    return parseSingleObjectFromRowDataAndFieldNames(rowData, fieldNames)
  })
}

function parseSingleObjectFromRowDataAndFieldNames (rowData, fieldNames) {
  var object = {
    date: null,
    seats: {}
  }
  var cellValues = getCellValuesByRowData(rowData)
  if (fieldNames.length !== cellValues.length) return console.error('number of field names (' + fieldNames.length + ") doesn't match the number of cell values (" + cellValues.length + ')')
  for (var i in fieldNames) {
    if (i == 0) object.date = parseCellDateStringToDate(cellValues[i])
    else object.seats[fieldNames[i]] = getAverageByRawCellValue(cellValues[i])
  }
  return object
}

function parseCellDateStringToDate (cellDateString) {
  var stringParts = cellDateString.split('-')
  var year = stringParts[0]
  var month = parseInt(stringParts[1]) - 1
  var day = stringParts[2]
  return new Date(year, month, day)
}

function getAverageByRawCellValue (cellValue) {
  var numberOfComponents = getNumberOfComponentsByCellValue(cellValue)
  var cumulation = parseCellValueFormulaToNumber(cellValue)
  var average = calculateAverageByCellValueAndNumberOfComponents(cumulation, numberOfComponents)
  return average
}

function getNumberOfComponentsByCellValue (cellValue) {
  return cellValue.split(/;/g).length
}

function parseCellValueFormulaToNumber (cellValue) {
  var cellValue = cellValue.replace(/;/g, '+')
  return eval(cellValue)
}

function calculateAverageByCellValueAndNumberOfComponents (cellValue, numberOfComponents) {
  return cellValue / numberOfComponents
}

function getCellValuesByRowData (rowData) {
  return rowData.split(',').slice(this.length)
}

module.exports = main
