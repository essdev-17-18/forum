"use strict";

var fs = require('fs');
var path = require('path')
var db = require('../DatabaseManager.js');
var dbr = require('../DBRow.js');
var log = require('../log.js');
var literals = require('../StringLiterals.js');

var possibleTypes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config/SQLDatatypes.json'), 'utf8')) 
var defaults = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config/defaultTables.json'), 'utf8')) 
var demodata = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config/mockData.json'), 'utf8')) 

var dbm = new db.DatabaseManager();
var numCreated = 0;

exports.setupDatabase = function() { 
	log.info("~~~~~~~~~~~~~~Starting Database Setup~~~~~~~~~~~~~~~")

	var totalLength = Object.keys(defaults).length;
	numCreated = 0;

	for (var prop in defaults) {
		createTable(defaults[prop][literals.tablename], defaults[prop][literals.fields], totalLength, numCreated);
	}
}

exports.loadDemoData = function() {
	log.info("~~~~~~~~~~~~~~Loading Demo Data~~~~~~~~~~~~~~~")
	var totalLength = Object.keys(demodata).length;
	numCreated = 0;
	for (var element in demodata) {
		loadRow(demodata[element][literals.table], demodata[element], totalLength, numCreated);
	}
}

function loadRow(table, fields, numElementsToCreate, numberCreated) {
	var newRow = new dbr.DBRow(table);
	newRow.setId = false;
	for (var field in fields) {
		if (field == literals.table)
			continue

		newRow.addQuery(field, fields[field]);
	}

	var id = newRow.getValue(literals.fieldID);

	newRow.insert().then(function() {
		log.info("Example row no. " + numCreated + " created!");
		numCreated++;
		if (numElementsToCreate == numCreated)
			log.info("~~~~~~~~~~~~~~~End of Demo Data Load~~~~~~~~~~~~~~~~\n\n");
	}, function(err){
		log.warn("Row no. " + numCreated + " not inserted, likely due to a previously logged error");
		log.warn("The id of the failing row was '" + id + "'");
		numCreated++;
		if (numElementsToCreate == numCreated)
			log.info("~~~~~~~~~~~~~~~End of Demo Data Load~~~~~~~~~~~~~~~~\n")

	});
}


function createTable(tableName, fields, numberTablesToCreate, numberCreated) { //TODO: make this more intelligent to match changes to defaultTables.json
	var keyCount = 0;
	var queryString = 'CREATE TABLE ' + tableName + ' (';

	for (var field in fields) {
		if(keyCount < Object.keys(fields).length-1) {
			queryString += field + ' ' + possibleTypes[fields[field][literals.type]];
			if (fields[field][literals.default]) {
				if (fields[field][literals.default] == 'CURRENT_TIMESTAMP' || fields[field][literals.default] == 'GETDATE()') {
					queryString += " DEFAULT " + fields[field][literals.default];
				}
				else {
					queryString += " DEFAULT '" + fields[field][literals.default] + "'";
				}
			}

			if (fields[field]["primaryKey"])
				queryString += " PRIMARY KEY"

			if (fields[field]["constraint"])
				queryString += " " + fields[field]["constraint"];

			queryString += ', ';
			keyCount++;
		}
		else {
			queryString += field + ' ' + possibleTypes[fields[field]["type"]];
			if (fields[field][literals.default]){ //make this better
				if (fields[field][literals.default] == 'CURRENT_TIMESTAMP' || fields[field][literals.default] == 'GETDATE()') {
					queryString += " DEFAULT " + fields[field][literals.default];
				}
				else {
					queryString += " DEFAULT '" + fields[field][literals.default] + "'";
				}
			}

			if (fields[field][literals.primaryKey])
				queryString += " PRIMARY KEY"
			
			queryString += ')';
		}
	}

	dbm.query(queryString).then(function(){
		numCreated++;
		log.info("Table '" + tableName + "' created!");
		if (numberTablesToCreate == numCreated)
			log.info("~~~~~~~~~~~~~~~End of Database Setup~~~~~~~~~~~~~~~~\n\n")
	}, function(err){
		numCreated++;
		log.warn("Table '" + tableName + "' not created! Likely due to a previously logged error")
		if (numberTablesToCreate == numCreated)
			log.info("~~~~~~~~~~~~~~~End of Database Setup~~~~~~~~~~~~~~~~\n")

	});
}