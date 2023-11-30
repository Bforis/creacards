const router = require('express').Router();

const authController = require('../../controllers/authController');
const planController = require('../../controllers/planController');

router.post('/',
    authController.authorizeRegisteredUser(['admin']),
    planController.createPlan);

router.get('/',
    authController.authorizeRegisteredUser(['admin', 'user']),
    planController.fetchPlans);

router.get('/:planId/checkout-session',
    authController.authorizeRegisteredUser(['user']),
    planController.getCheckoutSession);

router.get('/update-subscription',
    authController.authorizeRegisteredUser(['user']),
    planController.updateSubscription
)

module.exports = router;