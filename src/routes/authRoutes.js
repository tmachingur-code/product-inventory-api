const express = require("express");

const authController = require("../controllers/authController");
const validate = require("../middleware/validate");

const {
    registerUserSchema,
    loginUserSchema,
} = require("../schemas/authSchema");

const router = express.Router();

/**
 * Register a new user.
 *
 * POST /api/auth/register
 */
router.post(
    "/register",
    validate(registerUserSchema),
    authController.register
);

/**
 * Login an existing user.
 *
 * POST /api/auth/login
 */
router.post(
    "/login",
    validate(loginUserSchema),
    authController.login
);

module.exports = router;