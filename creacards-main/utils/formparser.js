const formidable = require('formidable');

/**
 * @name parseForm
 * @description parse text field and file fields
 */
exports.parseForm = function (req, configurations) {
    const form = new formidable.IncomingForm(configurations);

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields: fields, files: files });
        });
    })
}