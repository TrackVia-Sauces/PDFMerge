var fs = require('fs');
var TrackviaAPI = require('trackvia-api');
var pdf = require('html-pdf');
var Handlebars = require('handlebars');
var globalCallback = null;



/*********************************************
 * Configuation specific to this account
 * 
 * Assume no major change to data structure, all changes to 
 * this code to work on different accounts/tables/views
 * should be made here.
 * 
 * If you need to update the template edit the
 * templates/template.hbs file. For more
 * information on the Handlebars template language
 * see http://handlebarsjs.com/
 **********************************************/
// The API key that gives you access to the API
// This is found at https://go.trackvia.com/#/my-info
const API_KEY = '123456789';

// The name of the user to login as
const USERNAME = 'api.user@trackvia.com';

// The password of the user to login as
const PASSWORD = 'correcthorsebatterystaple';

// The address of the server you'll be using
const PRODUCTION_SERVER = 'https://go.trackvia.com';

// Name of the PDF we're going to create. This could
// be pulled from a field in the record or generated
// using a time stamp or other derived data
const PDF_FILE_NAME = "test.pdf";

// The numeric ID of the view to pull the data from
// You can find this in the URL of your view
// https://go.trackvia.com/#/apps/1/tables/2/views/3
const VIEW_ID = 3;

// The name of the field that is used to determine if a PDF
// should be created
const CREATE_PDF_CHECKBOX_FIELD_NAME = 'Create PDF';

// The name of the field were the PDF file should be uploaded
const PDF_FILE_FIELD_NAME = 'PDF';

/*********************************************
 * Everything below here should only be edited
 * if substantial changes to the data structure
 * that are used to create the PDF are made,
 * or if a change in behavior is needed.
 ********************************************/






// The TrackVia api for interaction with the data
var api = new TrackviaAPI(API_KEY, PRODUCTION_SERVER);

/**
 * Entry point into the micro service. This is where the
 * execution is kicked off
 */
exports.handler = function(event, context, callback) {
    console.log('---  starting  ---');
    globalCallback = callback;
    console.log(event);
    // make sure we have a record ID
    // Note, this will only be populated when an individual record
    // is edited/created. For bulk edit scenarios it's recommend
    // to use a filtered view that shows all records that need
    // a PDF created
    if (!event.recordId && !event.recordIds) {
            console.log('---  No record ID. I am out  ---');
    } else {
        context.callbackWaitsForEmptyEventLoop = false;
        step1GetData(api, event.recordId || event.recordIds[0]);
    }
}

/**
 * Step one get the data we want to build our PDF with
 * @param {TrackviaAPI} api 
 * @param {int} recordId 
 */
function step1GetData(api, recordId){

    // first we need to login
    api.login(USERNAME, PASSWORD)
    .then(() => {
            console.log('Logged In.');
            // now get a record
            return api.getRecord(VIEW_ID, recordId);
        })
    .then((record) => {
        console.log("I got the record");
        // got a response..
        console.log(record);
        // get the data
        var datas = record.data;
        // create a map of field names to values
        // be sure to strip out spaces from the field names
        // so it'll work with the template format
        dataMap = {};
        for(var key in datas){
            dataMap[key.replace(/\s/g, '')] = datas[key];
        }
        console.log("I created a data map");
        console.log(dataMap);

        // check if the CreatePDF checkbox is checked
        if(!datas[CREATE_PDF_CHECKBOX_FIELD_NAME] || datas[CREATE_PDF_CHECKBOX_FIELD_NAME].length == 0){
            console.log("There's nothing to do since the checkbox isn't checked")
            if(globalCallback) {
                globalCallback(null, 'Nothing to do');
            }
            return;
        }

        // now go make a PDF
        step2CreatePdf(api, recordId, dataMap);
        
    })
    .catch(function(err) {
        globalCallback(err, null);
    });
}


/**
 * In step 2 we create the HTML from our Handlebars template
 * and then we create a PDF from the HTML
 * @param {TrackviaAPI} api 
 * @param {int} recordId 
 * @param {object} dataMap 
 */
function step2CreatePdf(api, recordId, dataMap){
    console.log("step 2");
    // now get the template file
    fs.readFile('./templates/template.hbs', 'utf-8', function(err, hbsFile) {
        // if there's an error log it.
        if (err) { 
            console.log(err);
            globalCallback(err, null);
            return;
        }
        // no error so compile the template
        var template = Handlebars.compile(hbsFile);
        var html = template(dataMap);
        // print out the HTML just to be sure
        console.log("Created this HTML from the template");
        console.log(html);
        
        // setup some options so the PDF is lovely
        var options = {
            format: 'Letter',
            base: 'file://' + __dirname + '/',
            border: {
                "top": "0.5in",
                "right": "0.5in",
                "bottom": "0.5in",
                "left": "0.5in"
            }
        };

        // create the PDF
        pdf.create(html, options).toFile('/tmp/' + PDF_FILE_NAME, function(err, res) {
            // if something went wrong tell us and leave
            if (err) {
                console.log('ERROR: ' + err);
                if(globalCallback){
                    globalCallback(err, null);
                }
                return;
            }

            // nothing went wrong so onward and upward
            step3SavePDF(api, recordId, res.filename);
        });
    });
}


/**
 * In step 3 we upload the PDF to TrackVia and reset the 
 * checkbox field
 * @param {TrackviaAPI} api 
 * @param {int} recordId 
 * @param {String} fileName 
 */
function step3SavePDF(api, recordId, fileName){
    console.log("step 3");

    // upload the file to the API
    api.attachFile(VIEW_ID, recordId, PDF_FILE_FIELD_NAME, fileName)
    .then(function(result) {
        console.log('file added');

        // ok now get the identifier of the file that we added and 
        // associate it with the record.
        var fileIdentifier = result.identifier;
        
        // edit the record to set the pdf checkbox back to empty
        resetPDFCheckBox = {};
        resetPDFCheckBox[CREATE_PDF_CHECKBOX_FIELD_NAME] = [];

        // edit the record
        return api.updateRecord(VIEW_ID, recordId, resetPDFCheckBox);
    })
    .then(function(result) {
        // and we did it!!
        console.log("all done");
        globalCallback(null, 'success');
        return;
    })
    .catch(function(err) {
        globalCallback(err, null);
    });
}