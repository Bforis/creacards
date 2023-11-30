const router = require('express').Router();

const authController = require('../../controllers/authController');
const formController = require('../../controllers/formController');
const graphicController = require('../../controllers/graphicController');

router.post("/",
    //admin and other users can access this route
    authController.authorizeRegisteredUser(['admin', 'user', 'guest']),
    //handle file uploads
    formController.handleFileUploads({
        config: {
            keepExtensions: true,
            maxFileSize: 8000000
        },
        allowedFields: { 'preview': "image", 'original': "image" }, //prevent mismatch fields from uploading
        bucketDir: 'graphics'
    }),
    //upload graphic path in db
    graphicController.storeGraphicPath
);

router.get("/",
    //admin can access this routes
    authController.authorizeRegisteredUser(["admin", "user", "guest"]),
    //fetch uploaded graphics path
    graphicController.fetchGraphics
);

router.delete("/:graphicId",
    //only admin can access this routes
    authController.authorizeRegisteredUser(["admin"]),
    //delete graphics
    graphicController.deleteGraphic
);

module.exports = router;