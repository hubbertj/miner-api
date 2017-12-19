"use strict";
// Only other api's or controllers should be calling the error-api to generate a json error;

/*
Error json example
------------------
{
    error: [{
        language: en, // we should let teh user know this is a english error;
        code: 1001, //code from the database;
        msg: Invalid Google API key supplied //msg from the database;
    }]
}


200 – OK – Everything is working
201 – OK – New resource has been created
204 – OK – The resource was successfully deleted
304 – Not Modified – The client can use cached data
400 – Bad Request – The request was invalid or cannot be served. The exact error should be explained in the error payload. E.g. „The JSON is not valid“
401 – Unauthorized – The request requires an user authentication
403 – Forbidden – The server understood the request, but is refusing it or the access is not allowed.
404 – Not found – There is no resource behind the URI.
422 – Unprocessable Entity – Should be used if the server cannot process the entity, e.g. if an image cannot be formatted or mandatory fields are missing in the payload.
500 – Internal Server Error – API developers should avoid this error. If an error occurs in the global catch blog, the stracktrace should be logged and not returned as response.

------------------
*/

//temp list of errors;
var errorList = {
    1001: {
        msg: 'Invaild username/password.'
    },
    1002: {
        msg: 'Username does not exists in the systems.'
    },
    1003: {
        msg: 'Registration missing required field, first_name.'
    },
    1004: {
        msg: 'Registration missing required field, last_name.'
    },
    1005: {
        msg: 'Registration missing required field, email_address Or email is not a acceptable form'
    },
    1006: {
        msg: 'Registration missing required field, password.'
    },
    1007: {
        msg: 'Registration missing required field, password_confirm.'
    },
    1008: {
        msg: 'Failed to insert table, possible duplicate record or incorrect organization.'
    },
    1009: {
        msg: 'Failed to get organizations from organization_type table.'
    },
    1010: {
        msg: 'Reset needs a email_address.'
    },
    1011: {
        msg: 'Not supported call.'
    },
    1012: {
        msg: 'Call missing required parameter.'
    },
    1013: {
        msg: 'Failed to hash password, please check your password.'
    },
    1014: {
        msg: 'Password and password confirm do not match.'
    },
    1015: {
        msg: 'Registration missing required fields, organization_name and organization_type Or organization_hash must be submitted.'
    },
    1016: {
        msg: 'Registration missing required fields, organization_type.'
    },
    1017: {
        msg: 'Registration missing required fields, organization_name.'
    },
    1018: {
        msg: 'Failed, email_address is already registration in the system.'
    },
    1019: {
        msg: 'Failed to registration email, no token provided.'
    },
    1020: {
        msg: 'Registration failed please request a new email to be sent.'
    },
    1021: {
        msg: 'Registration failed, token has expired.'
    },
    1022: {
        msg: 'Your email address has already been confirmed, please login to enjoy the CounterDraft experience.'
    },
    1023: {
        msg: 'Missing parameter in call.'
    },
    1024: {
        msg: 'Unknown server error, please check your rest call for proper usage.'
    },
    1025: {
        msg: 'Failed, key and employee_id combination, user not found.'
    },
    1026: {
        msg: 'Missing key in header. ex = {key: <secret_key>, employee_id: <id_of_employee>}'
    },
    1027: {
        msg: 'Missing employee_id in header. ex = {key: <secret_key>, employee_id: <id_of_employee>}'
    },
    1028: {
        msg: 'UKNOWN Error employee does not have a valid organization, please contact a adminstrator for assistance.'
    },
    1029: {
        msg: 'Failed to find employee in organization, the attempt has been logged.'
    },
    1030: {
        msg: 'Failed to find organization, the attempt has been logged.'
    },
    1031: {
        msg: 'Missing required parameter, id'
    },
    1032: {
        msg: 'Employee not found in the system.'
    },
    1033: {
        msg: 'Failed to update employee.'
    },
    1034: {
        msg: 'A field you are trying to update cannot be changed.'
    },
    1035: {
        msg: 'first_name does not meet pattern.'
    },
    1036: {
        msg: 'last_name does not meet pattern.'
    },
    1037: {
        msg: 'username does not meet pattern.'
    },
    1038: {
        msg: 'email_address does not meet pattern.'
    },
    1039: {
        msg: 'Password doesn\'t meet min length.'
    },
    1040: {
        msg: 'Data of birth is missing or not formatted correctly, dates should be in a ISO 8601 string.'
    },
    1041: {
        msg: 'Patron not found in organization.'
    },
    1042: {
        msg: 'Missing old_password.'
    },
    1043: {
        msg: 'Missing new_password.'
    },
    1045: {
        msg: 'Invaild old_password.'
    },
    1046: {
        msg: 'Phone does not meet pattern.'
    },
    1047: {
        msg: 'Patron does not meet the min age.'
    },
    1048: {
        msg: 'Failed to update patron.'
    },
    1049: {
        msg: 'Missing patron.id from parameters.'
    },
    1050: {
        msg: 'Inncorrect permissions, only oganization adminstrator can do this.'
    },
    1051: {
        msg: 'Token is incorrect or has already expired.'
    },
    1052: {
        msg: 'Token is not present in the call.'
    },
    1053: {
        msg: 'Cannot update a employee from a patron rest call.'
    },
    1054: {
        msg: 'Cannot update a employee from a employee rest call.'
    },
    1055: {
        msg: 'Failed to update organization.'
    },
    1056: {
        msg: 'Failed to update or create in record in database.'
    },
    1057: {
        msg: 'Failed to create user invite code is invalid'
    },
    1058: {
        msg: 'Invitation not found in system.'
    },
    1059: {
        msg: 'Failed to retrieve employees from organization.'
    },
    1060: {
        msg: 'Failed to retrieve patrons from organization.'
    },
    1061: {
        msg: 'Failed to update, the organization must have at least one adminstrator account.'
    },
    1062: {
        msg: 'Failed to update, the organization only supports one adminstrator, please check settings before trying to update your adminstrator.'
    },
    1063: {
        msg: 'Failed to add address to organization.'
    },
    1064: {
        msg: 'Failed to remove addres from organization.'
    },
    1065: {
        msg: 'Failed to get addresses from address_type table.'
    },
    1066: {
        msg: 'Failed to get league from league_type table.'
    },
    1067: {
        msg: 'Failed to get game types from game_type table.'
    },
    1068: {
        msg: 'Game not found in organization.'
    },





    //Internal Server Errors
    9901: {
        msg: 'Failed to generate and save registration token for user.'
    },
    9902: {
        msg: 'Failed to send email to user, verify the email configs are correct.'
    },
    9903: {
        msg: 'Unknown error, failed to find user in system.'
    },
    9904: {
        msg: 'Database issue: Failed to update user.'
    },
    9905: {
        msg: 'Failed to find retrieve password token for user Or token is already expired.'
    },
    9906: {
        msg: 'Unknown error, failed to login in admin.'
    },
    9907: {
        msg: 'Unknown error, failed to delete data.'
    }
}

function errorApi() {
    var self = this;
    this.tag = 'error-api';

    this.errorObject = function() {
        this.language = "en";
        this.code = null;
        this.msg = "Unknown";
    }

    this.sendError = function(errorNum, status, res) {
        var eo = new this.errorObject();
        eo.code = errorNum;

        if (errorList[errorNum]) {
            eo.msg = errorList[errorNum].msg;
            if (res) {
                res.status(status).json({
                    error: [eo],
                    success: false
                });
            } else {
                return {
                    error: [eo],
                    success: false
                }
            }

        } else {
            if (res) {
                res.status(status).json({
                    error: [eo],
                    success: false
                });
            } else {
                return {
                    error: [eo],
                    success: false
                }
            }

        }
    }

    this.setErrorWithMessage = function(msg, status, res) {
        var eo = new this.errorObject();
        eo.msg = msg;
        res.status(status).json({
            error: [eo],
            success: false
        });
    }

    this.getErrorMsg = function(errorNum) {
        return errorList[errorNum].msg;
    }

    this.getError = function(msg) {
        var eo = new this.errorObject();
        if (msg) {
            eo.msg = msg;
        }
        return eo;
    }
}

module.exports = errorApi;
