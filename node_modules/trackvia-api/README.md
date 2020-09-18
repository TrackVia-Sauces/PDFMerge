# API-Node-SDK
Node SDK for working with application data in TrackVia.

## Getting Started
Login to your Trackvia account and navigate to https://go.trackvia.com/#/my-info. Copy down the API key.

##### Install via npm:
`npm install trackvia-api`

##### Include the source directly:
Include the `build/trackvia-api.js` into your project.

Create an instance of the Trackvia api with your API key:
```javascript
var TrackviaAPI = require('trackvia-api'); // if installed through npm
var TrackviaAPI = require('./path/to/trackvia-api.js'); // if include manually

var api = new TrackviaAPI('YOUR KEY HERE');
```

## Authenticating
You must authenticate before accessing any data in Trackvia. There are two methods to properly authenticate: `#login()` and `#setAccessToken()`. With the `API Authorization` release, an access token can also be passed via the constructor.

#### TrackviaAPI constructor
```javascript
var api = new TrackviaAPI('myAPIKey', 'myAccessToken');
// Successfully authenticated..
// Make additional request in here
```

#### #setAccessToken()
```javascript
api.setAccessToken('myAccessToken');
// Successfully authenticated..
// Make additional request in here
```

#### #login()
```javascript
api.login('myTrackviaAccount@gmail.com', 'myPassword')
.then(() => {
    // Successfully authenticated..
    // Make additional request in here
});
```

## Methods
All methods return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
These Promises will resolve to an object (JSON response from the request), except for files, which will resolve to a string of the binary representation of the file.

---


#### login(username, password)
_Authenticates as specified user._

Parameters:
* username : string
  * Username of Trackvia account.
* password : string

---

#### getApps()
_Gets all apps available._

Parameters: _none_

---

#### getAppByName(name)
_Get an app by name._

Parameters:
* name : string

---

#### getUsers([paging])
_Get all users, optionally paged._

Parameters:
* [paging : object]
  * Properties:
    * start : number
      * Starting index for paging.
    * max : number
      * Page size.

---

#### addUser(userInfo)
_Add new user._

Parameters:
* userInfo: object
  * Properties:
    * email : string
    * firstName : string
    * lastName : string

---

#### getViews()
_Get all views._

Parameters: _none_

---

#### getViewByName(name)
_Get view by name._

Parameters:
* name : string

---

#### getView(id, [paging , query])
_Get view by id, optionally paged, and optionally filtered records._

Parameters:
* id : number
* [paging : object]
  * Properties:
    * start : number
      * Starting index for paging.
    * max : number
      * Page size.
* [query : string]
  * Filter record results in view

---

#### getRecord(viewId, recordId)
_Get record by id._

Parameters:
* viewId : number
* recordId : number

---

#### addRecord(viewId, recordData)
_Add new record._

Parameters:
* viewId: number
* recordData : object
  * Key value pair of field names and values for new record.

---

#### updateRecord(viewId, recordId, recordData)
_Update exisiting record._

Parameters:
* viewId : number
* recordId : number
* recordData : object
  * Key value pair of field names and values to update in record.

---

#### updateRecords(accountId, appId, tableId, recordData)
_Batch Update existing records._

This method is not offically supported by TrackVia.

Parameters:
* accountId : number
* appId : number
* tableId : number
* recordData : object
  * { 'data': [{id: 123, value: 'newValue', type: 'currency', fieldMetaId: '456'}], recordIds: [1, 2, 3] }

---

#### deleteAllRecordsInView(viewId)
_Delete all records in a view._

Parameters:
* viewId : number

---

#### deleteRecord(viewId, recordId)
_Delete record._

Parameters:
* viewId : number
* recordId : number

---

#### getFile(viewId, recordId, fieldName, [options])
_Get a file from a record._

Parameters:
* viewId : number
* recordId : number
* fieldName : string
* [options : object]
  * Properties:
    * width : number
      * Desired width of image file
    * maxDimension : number
      * Desired max dimension for image file
    * NOTE: _These options only apply when the file is an image. Options are mutually exlusive, but if both are defined, only the width will be used)._


---

#### attachFile(viewId, recordId, fieldName, filePath)
_Attach a file to a record (or overwrite and existing file)._

Parameters:
* viewId : number
* recordId : number
* fieldName : string
* filePath : string
  * Path to file being attached

---

#### deleteFile(viewId, recordId, fieldName)
_Delete file from record._

Parameters:
* viewId : number
* recordId : number
* fieldName : string

---

#### getAccessToken()
_Get access token for authentication._

---

#### getUserKey()
_Get user key for authentication._


## Additional Information
For additional information visit https://developer.trackvia.com/.
Note that the endpoints explained in the [docs](https://developer.trackvia.com/livedocs) are from the public api itself. This library is a wrapper around those endpoints to make development easier.

## Testing
`git clone git@github.com:Trackvia/API-Node-SDK.git`
`cd API-Node-SDK`
`npm install`

Create a file `testConfig.js` by copy and pasting from `testConfig.template.js`. Open this new file in your text editor and set up a test app and test table in your account according to the instructions. For screenshots of the test setup, `open /test/testInstructions.html`.

`npm test`
