const PlanModel = require('../models/Plan.Model');
const UserModel = require('../models/User.Model');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


/**
 * @name createPlan
 * @description create new plan in database
 */
exports.createPlan = catchAsync(async (req, res, next) => {
    const plan = await PlanModel.create({
        title: req.body.title,
        amount: req.body.amount,
        createdAt: Date.now()
    });

    return res.status(200).json({
        status: "success",
        data: {
            plan
        }
    })
});

/**
 * @name fetchPlans
 * @description fetch all created plans
 */
exports.fetchPlans = catchAsync(async (req, res, next) => {
    const plans = await PlanModel.find({}).select('title amount').lean();

    return res.status(200).json({
        status: "success",
        result: plans.length,
        data: {
            plans
        }
    })
});

/**
 * @name getCheckoutSession
 * @description generate active session
 */
exports.getCheckoutSession = catchAsync(async (req, res, next) => {

    //prevent user from creating checkout if its previous plan is active
    if (req.user.activePlan) return next(new AppError("You have an active plan!", 400));

    //Get selected plan
    const plan = await PlanModel.findOne({ _id: req.params.planId });
    if (!plan) return next(new AppError("Plan not found!", 404));

    //create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        success_url: `${req.protocol}://${req.get('host')}/api/v1/update-subscription?days=${plan.days}&user=${req.user.userId}`,
        cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
        customer_email: req.user.email,
        client_reference_id: req.params.planId,
        line_items: [
            {
                name: plan.title,
                description: `${plan.days} days plan`,
                amount: plan.amount * 100,
                currency: "usd",
                quantity: 1
            }
        ]
    });

    return res.status(200).json({
        status: "success",
        data: {
            session
        }
    });
});

/**
 * @name updateSubscription
 * @descrption update user subscription after successful payment
 */
exports.updateSubscription = catchAsync(async (req, res, next) => {

    const subscription = Date.now() + (req.query.days * 24 * 60 * 60 * 1000);
    await UserModel.updateOne({ _id: req.query.user }, { subscription });

    return res.redirect(process.env.REDIRECT_URL);
});