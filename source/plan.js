function Plan () {
    this.limit = false;
    this.filteredColumns = [];
}

Plan.prototype.setLimit = function(limit) {
    this.limit = limit;
};

Plan.prototype.withinLimit = function(arr) {
    if (!this.limit) {
        return true;
    }
    return arr.length < this.limit;

};

Plan.prototype.setSelected = function(arrOfColumns) {
    this.filteredColumns = arrOfColumns;
};

Plan.prototype.selectColumns = function(rowObj) {
    // return the filtered columns from the rowObj
    if (!this.filteredColumns.length) {
        return rowObj;
    }
    var filteredObj = {};
    this.filteredColumns.forEach((column) => {
        filteredObj[column] = rowObj[column];
    });
    return filteredObj;
};


Plan.prototype.setCriteria = function(criteriaObj, table) {
    //
    var indexCriteria = {};
    var nonIndexCriteria = {};
    for (var column of Object.keys(criteriaObj)) {
        if (table.hasIndexTable(column)) {
            indexCriteria[column] = criteriaObj[column];
        } else {
            nonIndexCriteria[column] = criteriaObj[column];
        }
    }
    this.nonIndexedCriteria = nonIndexCriteria;
    this.indexedCriteria = indexCriteria;
};

Plan.prototype.matchesRow = function(row) {
    if (!this.nonIndexedCriteria) {
        return true;
    }
    for (var key in this.nonIndexedCriteria) {
        if (typeof this.nonIndexedCriteria[key] === 'function') {
            return this.nonIndexedCriteria[key](row[key]);
        } else if (row.hasOwnProperty(key) && this.nonIndexedCriteria[key] !== row[key] ) {
            return false;
        }
    }
    return true;
};
// for multiple indexed criteria
Plan.prototype.getInitialRowIds = function(table) {
    if (this.hasOwnProperty('indexedCriteria') && Object.keys(this.indexedCriteria).length !== 0) {
        return Object.keys(this.indexedCriteria)
            .map((column) => {
            var indexKey = this.indexedCriteria[column];
            return table.getIndexTable(column)[indexKey];
            })
            .reduce((idsA, idsB) => {
            var intersection = [];
            for (var id of idsA) {
                if (idsB.includes(id)) {
                    intersection.push(id);
                }
            }
            return intersection;
            })
    } else {
        return table.getRowIds();
    }
};

module.exports = Plan;
