const express = require("express")
const router = express.Router()
const {register, login, refreshAccessToken, logout, sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword} = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/register", register)
router.post("/login", login)
router.post("/refresh-token", refreshAccessToken)
router.post("/logout", logout)

router.post("/send-verify-email", authMiddleware, sendVerifyOtp)
router.post("/verify-email", authMiddleware, verifyEmail)

router.post("/send-reset-otp", sendResetOtp)
router.post("/reset-password", resetPassword)

module.exports = router