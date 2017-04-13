const DBH_CONSTANTS = require('./dbh-constants');
const fs = require('fs');


/** a promise returning the current JHipster app config as a JSON object */
const getAppConfig = directory => new Promise((resolve, reject) => {
    // path to '.yo-rc.json'
    const path = directory + DBH_CONSTANTS.appConfigFile;

    // if file exists, return it as a JSON object
    if (fs.existsSync(path)) {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(new Error(err));
            }
            const appConfigToJson = JSON.parse(data);

            // handle undefined object
            if (appConfigToJson) {
                resolve(appConfigToJson);
            } else {
                reject(new Error(`getAppConfig: no output. Type: ${typeof appConfigToJson}, value: ${appConfigToJson}`));
            }
        });
    } else {
        reject(new Error(`getAppConfig: file ${path} not found`));
    }
});


/** assert parameter is a non-empty string */
const isTrueString = x => typeof x === 'string' && x !== '';


/** validate user input when asking for a SQL column name */
const validateColumnName = (input, dbType) => {
    if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
        return 'Your column name cannot contain special characters';
    } else if (input === '') {
        return 'Your column name cannot be empty';
    } else if (dbType === 'oracle' && input.length > 30) {
        return 'The column name cannot be of more than 30 characters';
    }
    return true;
};


/** validate user input when asking for a SQL table name */
const validateTableName = (input, dbType) => {
    if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
        return 'The table name cannot contain special characters';
    } else if (input === '') {
        return 'The table name cannot be empty';
    } else if (dbType === 'oracle' && input.length > 14) {
        return 'The table name is too long for Oracle, try a shorter name';
    } else if (input.length > 30) {
        return 'The table name is too long, try a shorter name';
    }
    return true;
};


module.exports = {
    getAppConfig,
    isTrueString,
    validateColumnName,
    validateTableName
};
