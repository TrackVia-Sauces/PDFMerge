const Handlebars = require('handlebars');
var pdf = require('html-pdf');

module.exports = async function(record, template, filename) {

    process.env['FONTCONFIG_PATH'] = './fonts';

    const compile = Handlebars.compile(template.contents);
    const html = compile(record);

    const options = {
        phantomPath: './phantomjs',
        format: 'Letter',
        orientation: 'portrait',
        border: {
            top: '0.25in',
            right: '0.25in',
            bottom: '0.25in',
            left: '0.25in',
        },
        header: {
            height: '0.6 in',
        },
        footer: {
            height: '0.4 in',
        },
    };
    
    return new Promise((resolve, reject) => {
        pdf.create(html, options).toFile(filename, function(err, res) {
            if(err) {
                reject(err);
            } else {
                resolve(res.filename);
            }
        });
    });
}
