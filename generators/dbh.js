const DBH_CONSTANTS = require('./dbh-constants');
const jhipsterCore = require('jhipster-core');
const pluralize = require('pluralize');


/**
 * assert parameter is a non-empty string
 * @todo Now unused, consider removal
 */
const isNotEmptyString = x => typeof x === 'string' && x !== '';


/** Check that the build tool isn't unknown */
const isValidBuildTool = buildTool => DBH_CONSTANTS.buildTools.includes(buildTool);


/**
 * get hibernate SnakeCase in JHipster preferred style.
 *
 * @param {string} value - table column name or table name string
 * @see org.springframework.boot.orm.jpa.hibernate.SpringNamingStrategy
 */
const hibernateSnakeCase = (value) => {
    let res = '';

    if (value) {
        value = value.replace('.', '_');
        res = value[0];
        for (let i = 1, len = value.length - 1; i < len; i++) {
            if (value[i - 1] !== value[i - 1].toUpperCase() &&
                value[i] !== value[i].toLowerCase() &&
                value[i + 1] !== value[i + 1].toUpperCase()
            ) {
                res += `_${value[i]}`;
            } else {
                res += value[i];
            }
        }
        res += value[value.length - 1];
        res = res.toLowerCase();
    }

    return res;
};


/** */
const getColumnIdName = name => `${hibernateSnakeCase(name)}_id`;


/** */
const getPluralColumnIdName = name => getColumnIdName(pluralize(name));


/**
 * from the JHipster files where the original Spring naming strategies can be found,
 * remove the files that don't exist, depending on the current application build tool (Maven or Gradle)
 * if the app uses Maven, remove the Gradle file(s)
 * if the app uses Gradle, remove the Maven file(s)
 * the returned array holds only the existing files
 */
const getFilesWithNamingStrategy = (buildTool) => {
    // fail when application build tool is unknown
    if (!isValidBuildTool(buildTool)) {
        throw new Error(`buildTool '${buildTool}' is unknown`);
    }

    const baseFiles = DBH_CONSTANTS.filesWithNamingStrategy.base;
    return baseFiles.concat(DBH_CONSTANTS.filesWithNamingStrategy[buildTool]);
};


/**
 * Check if these relationships add constraints.
 * Typically, an one-to-many relationship doesn't add a constraint to the entity on the one side
 * but it does on the many side.
 *
 * @param relationships an array of relationship to check
 * @returns true if and only if it contains at least one relationship with a constraint, false otherwise
 */
const hasConstraints = (relationships) => {
    for(let relationship of relationships) {
        if (relationship.relationshipType === 'many-to-one' ||
            (relationship.relationshipType === 'one-to-one' && relationship.ownerSide) ||
            (relationship.relationshipType === 'many-to-many' && relationship.ownerSide)) {
            return true;
        }
    }
    return false;
};


/** Validate user input when asking for a SQL column name */
const validateColumnName = (input, dbType) => {
    if (input === '') {
        return 'Your column name cannot be empty';
    } else if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
        return 'Your column name cannot contain special characters';
    } else if (dbType === 'oracle' && input.length > DBH_CONSTANTS.oracleLimitations.tableNameHardMaxLength) {
        return 'Your column name is too long for Oracle, try a shorter name';
    }

    return true;
};


/**
 * Validate user input when asking for a SQL table name
 * This function closely follows JHipster's own validateTableName function
 * (in generator-jhipster/generators/entity/index.js)
 */
const validateTableName = (input, dbType) => {
    if (input === '') {
        return 'The table name cannot be empty';
    } else if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
        return 'The table name cannot contain special characters';
    } else if (dbType === 'oracle' && input.length > DBH_CONSTANTS.oracleLimitations.tableNameHardMaxLength) {
        return 'The table name is too long for Oracle, try a shorter name';
    } else if (dbType === 'oracle' && input.length > DBH_CONSTANTS.oracleLimitations.tableNameSoftMaxLength) {
        return 'The table name is long for Oracle, long table names can cause issues when used to create constraint names and join table names';
    } else if (jhipsterCore.isReservedTableName(input, dbType)) {
        return `'${input}' is a ${dbType} reserved keyword.`;
    }

    return true;
};


module.exports = {
    getColumnIdName,
    getFilesWithNamingStrategy,
    getPluralColumnIdName,
    hasConstraints,
    isNotEmptyString,
    isValidBuildTool,
    validateColumnName,
    validateTableName
};
