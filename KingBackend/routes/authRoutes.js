const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected route example
router.get('/me', authController.protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user,
        },
    });
});

module.exports = router;