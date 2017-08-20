const fs = require('fs');

function Table (folderPath) {
    this.folderPath = folderPath;
    this.indexTable = {}
}

Table.toFilename = function(id) {
    return id + '.json';
};

Table.toId = function(filename) {
    var splitString = filename.split('.json');
    return splitString[0];
};

Table.prototype.read = function(id) {
    try {
        var filePath = this.folderPath + '/' + Table.toFilename(id);
        var fileString =  fs.readFileSync(filePath).toString();
        return JSON.parse(fileString);
    } catch(e) {
        return undefined;
    }
};

Table.prototype.getRowIds = function() {
    var directory = fs.readdirSync(this.folderPath);
    return directory.map((filename) => Table.toId(filename)); // get .toId of filenames
};

Table.prototype.hasIndexTable = function(indexName) {
    if (this.indexTable.hasOwnProperty(indexName)) {
        return true;
    }
    return false;
};

Table.prototype.addIndexTable = function(indexName) {
    if (!this.hasIndexTable(indexName)) {
        this.indexTable[indexName] = {};
    }
    // create a hash map of the years
    var tableData = this.getRowIds().map((id) => this.read(id));
    //console.log(tableData);
    // create a hash of the years
    tableData.forEach((row) => {
        var hashIndex = row[indexName];
        if (this.indexTable[indexName].hasOwnProperty(hashIndex)) {
            this.indexTable[indexName][hashIndex].push(row.id);
        } else {
            this.indexTable[indexName][hashIndex] = [];
            this.indexTable[indexName][hashIndex].push(row.id);
        }
    });
};

Table.prototype.getIndexTable = function(indexName) {
    return this.indexTable[indexName];
};


module.exports = Table;
