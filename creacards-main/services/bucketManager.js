const fileManager = require('../utils/fileManager');

const AWS = require('aws-sdk');

//AWS.config.update({ region: process.env.AWS_REGION });

const s3 = new AWS.S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
    Bucket: process.env.AWS_BUCKET
});

//upload file from temp folder to aws bucket
exports.uploadFromTemp = async function ({ dir, bucketDir, pathId, filename, contentType, }) {
    const fileBuffer = await fileManager.readFile(`${dir}/${filename}`);
    const payload = {
        Bucket: process.env.AWS_BUCKET,
        Key: `/${bucketDir}/${pathId}/${filename}`,
        Body: fileBuffer,
        ACL: 'public-read'
    }

    if (contentType)
        payload["ContentType"] = contentType;

    const bucketRes = await this.uploadFile(payload);
    return {
        filepath: bucketRes.Key,
        fileurl: bucketRes.Location
    };
}

exports.uploadFile = function (payload) {
    return new Promise((resolve, reject) => {
        s3.upload(payload, function (err, data) {
            if (err) reject(err)
            else resolve(data)
        });
    })
}

exports.deleteFile = function (keys) {
    const payload = {
        Bucket: process.env.AWS_BUCKET,
        Delete: { Objects: keys }
    }
    return new Promise((resolve, reject) => {
        s3.deleteObjects(payload, function (err, data) {
            if (err) {
                console.log("In Error", { status: "error", error: err });
                reject(err);
            } else {
                console.log("In Data", data);
                resolve({ data: data, status: "success" })
            }
        })
    })
}