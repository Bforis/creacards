const fs = require('fs');

exports.createFolder = (path) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, (err, path) => {
            if (err) reject(err);
            resolve(path);
        });
    });
}

exports.deleteFolder = (path) => {
    try {
        //remove directory content
        fs.readdirSync(path).forEach((filePath) => {
            const currPath = path + "/" + filePath;
            if (fs.lstatSync(currPath).isDirectory()) {
                deleteFolder();
            } else {
                fs.unlinkSync(currPath);
            }
        });
        //remove main directory
        fs.rmdirSync(path);
        return {
            status: "success",
            message: "Directory removed!"
        }
    } catch (err) {
        return {
            status: "fail",
            message: err.message
        }
    }
}

exports.readFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, buffer) => {
            if (err) reject(err);
            resolve(buffer);
        });
    });
}