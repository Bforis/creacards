const router = require('express').Router();

const authController = require('../../controllers/authController');
const userController = require('../../controllers/userController');

/**
 * @description signup route for users
 */
router.post('/signup', authController.signUp, authController.createAuthenticationToken);

/**
 * @description login route for all types of users
 */
router.post('/login', authController.login, authController.createAuthenticationToken);

/**
 * @description verify user token on page routing
 */
router.get('/verify', authController.verifyToken);

/**
 * @description fetch user profile
 */
router.get('/profile',
    authController.authorizeRegisteredUser(['admin', 'user']),
    userController.fetchProfile
);

module.exports = router;