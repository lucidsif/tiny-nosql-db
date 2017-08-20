const Plan = require('./plan');
const fs = require('fs');
const Table = require('./table');


function FQL(tableInstance) {
    this.table = tableInstance;
    this.plan = new Plan();
}

FQL.prototype.get = function() {
    var rows = [];
    var rowIdArr = this.plan.getInitialRowIds(this.table);
    try {
        for (var i = 0; i < rowIdArr.length; i++) {
            if (!this.plan.withinLimit(rows)) {
                break;
            }
            rows.push(this.table.read(rowIdArr[i]));
        }
    } catch(e) {
        console.log('error in filesync', e);
    }
    var selectedRows = rows.map((row) => this.plan.selectColumns(row));
    var rowsWithCriteria = selectedRows.filter((row) => this.plan.matchesRow(row));

    return rowsWithCriteria;
};

FQL.prototype.count = function() {
    return this.table.getRowIds().length;
};

FQL.prototype.limit = function(limit) {
    var siblingQuery = new FQL(this.table);
    siblingQuery.plan.setLimit(limit);
    return siblingQuery;
};

FQL.prototype.select = function(...selector) {
    // if * get all
    // if a key, pass key to setSelected and selectColumns
    var arrOfSelectors;
        var siblingQuery = new FQL(this.table);
        if (selector[0] === '*') {
            arrOfSelectors = [];
        } else {
            arrOfSelectors = selector;
        }
        siblingQuery.plan.setSelected(arrOfSelectors);
        return siblingQuery;
};

FQL.prototype.where = function(criteriaObj) {
    var table = this.table;
    var siblingQuery = new FQL(this.table);
    siblingQuery.plan.setCriteria(criteriaObj, table);
    return siblingQuery;
};

FQL.merge = function(obj1, obj2) {
    return Object.assign(obj1, obj2)
};
FQL.prototype.innerJoin = function(otherQuery, func) {
    var thisQueryRows = this.get();
    var otherQueryRows = otherQuery.get();

    var newDataObj = [];

    for (var i = 0; i < thisQueryRows.length; i++) {
        for (var j = 0; j < otherQueryRows.length; j++) {
            if (func(thisQueryRows[i], otherQueryRows[j])) {
                newDataObj.push(FQL.merge(thisQueryRows[i], otherQueryRows[j]));
            }
        }
    }
    return new FQL(newDataObj);
    // for (var key in thisTable) {
    //     if (func())
    // }
    // create a new table
};

module.exports = FQL;
