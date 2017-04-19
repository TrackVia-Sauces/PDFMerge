# PDF Generation

This sauce shows how to use third party open source libraries to create a PDF from your record data. This particular example uses the Handlebars templating engine [http://handlebarsjs.com/](http://handlebarsjs.com/) via the handlebars NPM package [https://www.npmjs.com/package/handlebars](https://www.npmjs.com/package/handlebars) to create an
HTML template with your data. Then we use the NPM package [https://www.npmjs.com/package/html-pdf](https://www.npmjs.com/package/html-pdf) to turn that HTML into a PDF.

This example looks for a checkbox field called `Create PDF` to see if a PDF should be made. If any value is checked in that checkbox field then it will create a PDF; if no value is checked no PDF will be created.
## Setup

To use this sauce edit the constants in the [index.js](https://github.com/Trackvia/Sauces/blob/master/PDF_generation/index.js) file to align with your account's setup. You'll need to put in your API user key, username, password, the numeric viewID of the view where the record to be turned into a PDF can be found, the name of the file field where the PDF should be uploaded, and the name of the checkbox field that will determine if a PDF should be created.

In the [template/template.hbs](https://github.com/Trackvia/Sauces/blob/master/PDF_generation/templates/template.hbs) file replace the fields in double curly braces with the names of the fields in your record. The template won't allow spaces in the names so remove any spaces in your field name. For example a field called `"First Name"` should be represented as `{{FirstName}}` in the template file.

To install this, compress everything into a .zip file and upload as an integration in TrackVia [https://go.trackvia.com/#/integrations](https://go.trackvia.com/#/integrations). Then go to the table where the records you want to make into PDFs are located and associate the integration with a table event, such as `After Insert`. The exact URL you use will depend on your account, but it will be something along the lines of https://go.trackvia.com/#/apps/1/tables/edit/2/integrations. You can associate the same integration with more than one table event if you want to create PDFs on both create and edit events. 

That's it, you should be good to go after that. For more info on how this works please see the comments in [index.js](https://github.com/Trackvia/Sauces/blob/master/PDF_generation/index.js).
