const mongoose = require('mongoose');

const Tracker = require('../utils/Tracker');
const fileManager = require('../utils/fileManager');
const formParser = require('../utils/formparser');

const bucketManager = require('../services/bucketManager');

/**
 * @name handleFileUploads
 * @description handle file upload from multipart and upload it to aws
 */
exports.handleFileUploads = (options) => {
    //return request handler function
    return async (req, res, next) => {
        //store all variables in one object
        const state = {
            tracker: new Tracker(), //tracker upload time [only for testing purpose]
            pathId: mongoose.Types.ObjectId(), //unique mongo id
            errors: [], //store errors
            filesInfo: [] //store info of uploaded file in aws bucket
        }

        try {
            //initialize temp dir name to upload file
            state.tempDir = `./uploads/${state.pathId}`; //path of temp folder
            //Create temp directory inside upload folder with the name of mongo id
            console.log("1: Creating Folder!");
            await fileManager.createFolder(state.tempDir);
            //Parse file and upload in temp folder
            console.log("2: Parsing and upload file from req object!");
            state.tracker.startTimer();
            const formdata = await formParser.parseForm(req, {
                ...options.config,
                uploadDir: state.tempDir,
            });
            console.log(`::File Uploading from client to server took ${state.tracker.result() / 1000}s`);

            console.log("3: Validate Files, Filter Files, Upload Files!");
            //validate uploaded file fields and file types
            const fields = Object.keys(options.allowedFields);

            for await (let field of fields) {

                console.log("> checking allowed field");
                if (!formdata.files[field]) continue;

                const file = { ...formdata.files[field] };

                console.log("> checking file type!");
                if (!file?.mimetype?.startsWith(options.allowedFields[field])) {
                    state.errors.push(`${field} field contains ${file?.mimetype} file!`);
                    continue;
                }
                //read and upload file to aws
                console.log("> uploading file to aws!");

                //set content type of svg
                const contentType = file.newFilename.toLowerCase().endsWith('svg') ? { contentType: "image/svg+xml" } : {};

                state["tracker"].startTimer();
                const bucketRes = await bucketManager.uploadFromTemp({
                    dir: state.tempDir,
                    pathId: state.pathId,
                    filename: file.newFilename,
                    bucketDir: options.bucketDir,
                    ...contentType
                });
                console.log(`:::File Uploading from server to bucket took ${state.tracker.result() / 1000}s`);

                //store uploaded file info in paths
                state["filesInfo"].push({ field, filename: file.newFilename, ...bucketRes });
            };

            //delete temp folder after successfull upload
            console.log("4: Deleting Temp Folder");
            fileManager.deleteFolder(state.tempDir);

            //store data in req.body and move to next middleware to store file path in db
            req.body = {
                ...formdata.fields,
                pathId: state.pathId,
                filesInfo: state.filesInfo
            }
            return next();

        } catch (err) {
            //delete temp folder on error
            console.log("ERR1: Deleting Temp Folder");
            fileManager.deleteFolder(state["tempDir"]);
            //push err message in error logs
            state.errors.push(err.message);
            //send back response to user
            return res.status(200).json({
                status: "fail",
                errorLogs: state.errors
            });
        }
    };
}