var request = require('request');
var fs = require('fs');

var tvRequest = require('./lib/tv-request.js'),
    auth = require('./lib/auth.js');

class TrackviaAPI {
    /**
     * Creates new TrackviaAPI object
     * @param {String} apikey
     */
    constructor(userKey, host = 'https://go.trackvia.com:443') {
        if(!userKey) {
            throw new Error('Must provide API key to TRackviaAPI constructor');
        }

        global.__tv_host = host;

        auth.setUserKey(userKey);
    }

    /**
     * Authenticate into system as specified user.
     * Access and refresh tokens will be handled internally.
     * @param {String} username
     * @param {String} password
     * @return {Promise<Object>}
     */
    login(username, password) {
        var params = {
            client_id: 'TrackViaAPI',
            grant_type: 'password',
            username: username,
            password: password
        };

        var options = {
            form: true,
            requiresAuth: false
        }

        return tvRequest.post('/oauth/token', params, options)
        .then((res) => {
            if(res.access_token) {
                auth.setAccessToken(res.access_token);
                auth.setRefreshToken(res.refresh_token, res.expires_in);
            } else {
                throw new Error('Access Token not returned from login');
            }

            return res;
        })
        .catch((code) => {
            throwError(code, 'Failed login.');
        });
    }

    /**
     * Get all apps available.
     * @return {Promise<Object>}
     */
    getApps() {
        return tvRequest.get('/openapi/apps')
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, 'Failed to get apps.');
        });
    }

    /**
     * Get an app by name.
     * @param {String} name
     * @return {Promise<Object>}
     */
    getAppByName(name) {
        if(!name) {
            throw new Error('Must provide name argument for getApp');
        }

        return tvRequest.get('/openapi/apps', { name: name })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to get app: ${name}`);
        });
    }

    /**
     * Get all users, optionally paged.
     * @param {Object} [paging] Paging object with properties start and max (integers).
     * @returns {Promise<Object>}
     */
    getUsers(paging) {
        var paging = paging || {};

        return tvRequest.get('/openapi/users', {
            start: paging.start,
            max: paging.max
        })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, 'Failed to get users.');
        });
    }

    /**
     * Add new user.
     * @param {Object} userInfo Object with three string properties: email, firstName, and lastName) all required.
     * @returns Promise<Object>
     */
    addUser(userInfo) {
        if(!userInfo.email) {
            throw new Error('email must be supplied when adding user');
        }
        if(!userInfo.firstName) {
            throw new Error('firstName must be supplied when adding user');
        }
        if(!userInfo.lastName) {
            throw new Error('lastName must be supplied when adding user');
        }

        return tvRequest.post('/openapi/users', userInfo, { querystring: true })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to add user: ${userInfo.email}`);
        });
    }

    /**
     * Get all views.
     * @returns Promise<Object>
     */
    getViews() {
        return tvRequest.get('/openapi/views')
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, 'Failed to get views');
        });
    }

    /**
     * Get view by name.
     * @param {String} name Name of view to be fetched.
     * @returns Promise<Object>
     */
    getViewByName(name) {
        if(!name) {
            throw new Error('name must be supplied when getting view by name');
        }

        return tvRequest.get('/openapi/views', {
            name: name
        })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to get view: ${name}`);
        });
    }

    /**
     * Get view by id, optionally paging, and optionally query records.
     * @param {Number} id of view
     * @param {Object} [paging] Paging object with properties start and max (integers).
     * @param {String} [query] Filter record results in view.
     * @returns Promise<Object>
     */
    getView(id, paging, query) {
        var paging = paging || {};

        if(query) {
            return tvRequest.get(`/openapi/views/${id}/find`, {
                q: query,
                start: paging.start,
                max: paging.max
            })
            .then((res) => {
                return res;
            })
            .catch((code) => {
                throwError(code, `Failed to get view: ${id}`)
            });
        } else {
            return tvRequest.get(`/openapi/views/${id}`, {
                start: paging.start,
                max: paging.max
            })
            .then((res) => {
                return res;
            })
            .catch((code) => {
                throwError(code, `Failed to get view: ${id}`)
            });;
        }
    }

    /**
     * Get record by id.
     * @param {Number} viewId
     * @param {Number} recordId
     * @returns Promise<Object>
     */
    getRecord(viewId, recordId) {
        if(!viewId) {
            throw new Error('view id must be supplied to getRecord');
        }
        if(!recordId) {
            throw new Error('record id must be supplied to getRecord');
        }

        return tvRequest.get(`/openapi/views/${viewId}/records/${recordId}`)
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to get record: ${recordId}`);
        });
    }

    /**
     * Add new record.
     * @param {Number} viewId
     * @param {Object} recordData key value pair of columns and values for new record.
     * @returns Promise<Object>
     */
    addRecord(viewId, recordData) {
        if(!viewId) {
            throw new Error('view id must be supplied to addRecord');
        }

        var recordRequestData = {};

        if(Array.isArray(recordData)) {
            recordRequestData.data = recordData;
        } else {
            recordRequestData.data = [recordData];
        }

        return tvRequest.makeRequest({
            url: __tv_host + `/openapi/views/${viewId}/records`,
            method: 'POST',
            json: true,
            body: recordRequestData
        }, { querystring: true })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to add record. View id: ${viewId}`);
        });
    }

    /**
     * Update existing record
     * @param {Number} viewId
     * @param {Number} recordId
     * @param {Object} recordData key value pair of columns and values to update in record.
     * @returns Promise<Object>
     */
    updateRecord(viewId, recordId, recordData) {
        if(!viewId) {
            throw new Error('view id must be supplied to updateRecord');
        }
        if(!recordId) {
            throw new Error('record id must be supplied to updateRecord');
        }

        var recordRequestData = {};
        recordRequestData.data = [recordData];

        return tvRequest.makeRequest({
            url: __tv_host + `/openapi/views/${viewId}/records/${recordId}`,
            method: 'PUT',
            json: true,
            body: recordRequestData
        }, { querystring: true })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to update record: ${recordId}`);
        });
    }

    /**
     * Batch update records
     * @param {Number} accountId
     * @param {Number} appId
     * @param {Number} tableId
     * @param {Object} recordData
     */
    updateRecords(accountId, appId, tableId, recordData) {
        return tvRequest.makeRequest({
            url: __tv_host + `/accounts/${accountId}/apps/${appId}/tables/${tableId}/records`,
            method: 'PUT',
            json: true,
            headers: {
                'Authorization': `Bearer ${auth.getAccessToken()}`
            },
            body: recordData
        }, { querystring: true })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to update records.`);
        });
    }

    /**
     * Delete all records in a view.
     * @param {Number} viewId
     * @returns Promise<Object>
     */
    deleteAllRecordsInView(viewId) {
        if(!viewId) {
            throw new Error('view id must be supplied to deleteAllRecordsInView');
        }

        return tvRequest.makeRequest({
            url: __tv_host + `/openapi/views/${viewId}/records/all`,
            method: 'DELETE',
            json: true
        }, { querystring: true })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to delete all records in view: ${viewId}`);
        });
    }

    /**
     * Delete record.
     * @param {Number} viewId
     * @param {Number} recordId
     * @returns Promise<Object>
     */
    deleteRecord(viewId, recordId) {
        if(!viewId) {
            throw new Error('view id must be supplied to deleteRecord');
        }
        if(!recordId) {
            throw new Error('record id must be supplied to deleteRecord');
        }

        return tvRequest.makeRequest({
            url: __tv_host + `/openapi/views/${viewId}/records/${recordId}`,
            method: 'DELETE',
            json: true
        }, { querystring: true })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to delete record: ${recordId}`);
        });
    }

    /**
     * Get a file from a record
     * @param {Number} viewId
     * @param {Number} recordId
     * @param {String} fieldName Name of field to get file from.
     * @param {Object} options When getting an image file, you can specify width or maxDimension (Numbers). (Options are mutually exlusive)
     * @returns Promise<Binary>
     */
    getFile(viewId, recordId, fieldName, options) {
        if(!viewId) {
            throw new Error('view id must be supplied to downloadFile');
        }
        if(!recordId) {
            throw new Error('record id must be supplied to downloadFile');
        }
        if(!fieldName) {
            throw new Error('field name must be supplied to downloadFile');
        }

        var options = options || {};

        var requestDetails = {
            url: __tv_host + `/openapi/views/${viewId}/records/${recordId}/files/${fieldName}`,
            method: 'GET',
            encoding: 'binary',
            qs: {}
        };

        if(options.width) {
            requestDetails.qs.width = options.width;
        }
        else if(options.maxDimension) {
            requestDetails.qs.maxDimension = options.maxDimension;
        }

        return tvRequest.makeRequest(requestDetails, { raw: true, fullResponse:true })
        .then((response) => {
            return response;
        })
        .catch((code) => {
            throwError(code, `Failed to get file. View: ${viewId}  Record: ${recordId}  Field Name: ${fieldName}`);
        });
    }

    /**
     * Attach a file to a record. (can be used to overwrite existing file if any)
     * @param {Number} viewId
     * @param {Number} recordId
     * @param {String} fieldName Name of field to add file to.
     * @returns Promise<Object>
     */
    attachFile(viewId, recordId, fieldName, filePath) {
        if(!viewId) {
            throw new Error('view id must be supplied to attachFile');
        }
        if(!recordId) {
            throw new Error('record id must be supplied to attachFile');
        }
        if(!fieldName) {
            throw new Error('field name must be supplied to attachFile');
        }
        if(!filePath) {
            throw new Error('file path must be supplied to attachFile');
        }

        var fileStream = fs.createReadStream(filePath);

        var requestDetails = {
            url: __tv_host + `/openapi/views/${viewId}/records/${recordId}/files/${fieldName}`,
            method: 'POST',
            encoding: 'binary',
            formData: {
                file: fileStream
            }
        };

        return tvRequest.makeRequest(requestDetails, { raw: true, querystring: true })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to attach file. View: ${viewId}  Record: ${recordId}  Field Name: ${fieldName}`);
        });
    }


    /**
     * Delete file from record.
     * @param {Number} viewId
     * @param {Number} recordId
     * @param {String} fieldName Name of field to remove file from.
     * @returns Promise<Object>
     */
    deleteFile(viewId, recordId, fieldName) {
        if(!viewId) {
            throw new Error('view id must be supplied to deleteFile');
        }
        if(!recordId) {
            throw new Error('record id must be supplied to deleteFile');
        }
        if(!fieldName) {
            throw new Error('field name must be supplied to deleteFile');
        }

        var requestDetails = {
            url: __tv_host + `/openapi/views/${viewId}/records/${recordId}/files/${fieldName}`,
            method: 'DELETE'
        };

        return tvRequest.makeRequest(requestDetails, { querystring: true, raw: true })
        .then((res) => {
            return res;
        })
        .catch((code) => {
            throwError(code, `Failed to delete file. View: ${viewId}  Record: ${recordId}  Field Name: ${fieldName}`);
        });;
    }
    
    /**
     * Set access token for authentication.
     * @returns string
     */
    setAccessToken(accessToken) {
        auth.setAccessToken(accessToken);
    }

    /**
     * Get access token for authentication.
     * @returns string
     */
    getAccessToken() {
        return auth.getAccessToken();
    }

    /**
     * Get user key for authentication.
     * @returns string
     */
    getUserKey() {
        return auth.getUserKey();
    }
}

function throwError(statusCode, message) {
    throw new Error(`${message} Response Code: ${statusCode}`);
}

module.exports =  TrackviaAPI;
