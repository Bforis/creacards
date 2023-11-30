const router = require('express').Router();

const authController = require('../../controllers/authController');
const formController = require('../../controllers/formController');
const imageController = require('../../controllers/imageController');

router.post("/",
    //only admin can access this route
    authController.authorizeRegisteredUser(['admin', 'user', 'guest']),
    //handle file uploads
    formController.handleFileUploads({
        config: {
            keepExtensions: true,
            maxFileSize: 8000000
        },
        allowedFields: { 'preview': "image", 'original': "image" }, //prevent mismatch fields from uploading
        bucketDir: 'images'
    }),
    //upload image path in db
    imageController.storeImagePath
);

router.get("/",
    //admin and other subscription users can access this routes
    authController.authorizeRegisteredUser(["admin", "user", "guest"]),
    //fetch uploaded images path
    imageController.fetchImages
);

router.delete("/:imageId",
    //only admin can access this routes
    authController.authorizeRegisteredUser(["admin", "user"]),
    //delete images
    imageController.deleteImage
);

module.exports = router;