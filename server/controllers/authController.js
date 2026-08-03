const express = require("express")
const User = require("../models/user")
const bcrypt = require("bcrypt")
const {createAccessToken, createRefreshToken, setAuthCookie, clearAuthCookies} = require("../utils/tokens")
const jwt = require("jsonwebtoken")
const {transporter, mailOptions} = require("../config/nodemailer")
const generateOtp = require("../utils/otp")

const register = async (req, res) => {
    try {
        const {name, email, password} = req.body || {}

        if (!name || !email || !password) {return res.status(400).json({success: false, message: "Name, email and password are mandatory!"})}
        if (password.length < 5) {return res.status(400).json({success: false, message: "Password too short!"})}

        const userAlreadyExists = await User.findOne({email})
        if (userAlreadyExists) {return res.status(400).json({success: false, message: "User already registered with this email!"})}

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({name, email, password: hashedPassword})

        const mail = mailOptions(email, "Welcome to the QR Code Redirect App!", "You have successfully created your account! Next step is to verify your email on the website.")

        return res.status(201).json({success: true, message: "Registered successfully!"})
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!"}, error)
    }
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body || {}

        if (!email || !password) {return res.status(400).json({success: false, message: "Email and password are mandatory!"})}

        const user = await User.findOne({email})
        if (!user) {return res.status(400).json({success: false, messsage: "Invalid credentials!"})}

        const passwordsMatch = await bcrypt.compare(password, user.password)
        if (!passwordsMatch) {return res.status(400).json({success: false, message: "Invalid credentials!"})}

        // set cookies
        const accessToken = createAccessToken(user)
        const refreshToken = createRefreshToken(user)

        user.refreshToken = await bcrypt.hash(refreshToken, 10)
        await user.save()

        setAuthCookie(res, accessToken, refreshToken)

        return res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        })
        
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error})
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {return res.status(401).json({success: false, message: "No refresh token provided!"})}

        const {userId} = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(userId)
        if (!user || !user.refreshToken) {return res.status(401).json({success: false, message: "The refresh token is invalid or expired!"})}

        const refreshTokenMathces = await bcrypt.compare(refreshToken, user.refreshToken)

        if (!refreshTokenMathces) {return res.status(401).json({success: false, message: "The refresh token is invalid or expired!"})}

        const accessToken = createAccessToken(user)
        const newRefreshToken = createRefreshToken(user) // rotation
        user.refreshToken = await bcrypt.hash(newRefreshToken, 10)
        await user.save()

        setAuthCookie(res, accessToken, newRefreshToken)

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully!",
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        })
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error})
    }
}

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {return res.status(401).json({success: false, message: "No refresh token provided!"})}

        const {userId} = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(userId)
        if (!user || !user.refreshToken) {return res.status(401).json({success: false, message: "The refresh token is invalid or expired!"})}

        const refreshTokenMathces = await bcrypt.compare(refreshToken, user.refreshToken)

        if (!refreshTokenMathces) {return res.status(401).json({success: false, message: "The refresh token is invalid or expired!"})}

        user.refreshToken = null
        await user.save()

        clearAuthCookies(res)

        return res.status(200).json({success: true, message: "Logged out successfully!"})
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error})
    }
}

const sendVerifyOtp = async (req, res) => {
    try {
        const userData = req.userData

        const otp = generateOtp()

        const user = await User.findById(userData.userId)
        if (!user) {return res.status(400).json({success: false, message: "Couldn't find user!"})}
        if (user.isVerified) {return res.status(400).json({success: false, message: "User already verified!"})}

        user.verifyOtp = otp
        user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000
        await user.save()
        
        const mail = mailOptions(userData.email, "Email verification code - QR Code Redirect App", `Your account verification one-time-password is ${otp}. Go back to the website and paste it into the required field!`)

        await transporter.sendMail(mail)

        return res.status(200).json({success: true, message: "Verification email sent!"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Something went wrong!", error})
    }
}

const verifyEmail = async (req, res) => {
    try {
        const {otp} = req.body || {}
        if (!otp) {return res.status(400).json({success: false, message: "No otp provided!"})}

        const userData = req.userData

        const user = await User.findById(userData.userId)
        if (!user) {return res.status(400).json({success: false, message: "Couldn't find user!"})}

        if (otp !== user.verifyOtp || Date.now() > user.verifyOtpExpiresAt) {return res.status(400).json({success: false, message: "Invalid or expired otp!"})}

        user.isVerified = true
        user.verifyOtp = ""
        user.verifyOtpExpiresAt = 0
        await user.save()

        return res.status(200).json({success: true, message: "Email verification successful!"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Something went wrong!", error})
    }
}

const sendResetOtp = async (req, res) => {
    try {
        const {userEmail} = req.body || {}
        if (!userEmail) {return res.status(400).json({success: false, message: "No email provided!"})}

        const otp = generateOtp()

        const user = await User.findOne({email: userEmail})
        if (!user) {return res.status(400).json({success: false, message: "Couldn't find user!"})}

        user.resetOtp = otp
        user.resetOtpExpiresAt = Date.now() + 60 * 60 * 1000
        await user.save()
        
        const mail = mailOptions(userEmail, "Password reset code - QR Code Redirect App", `Your password reset one-time-password is ${otp}. Go back to the website and paste it into the required field!`)

        await transporter.sendMail(mail)

        return res.status(200).json({success: true, message: "Password reset email sent!"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Something went wrong!", error})
    }
}

const resetPassword = async (req, res) => {
    try {
        const {otp, newPassword, userEmail} = req.body || {}
        if (!otp) {return res.status(400).json({success: false, message: "No otp provided!"})}
        if (!newPassword) {return res.status(400).json({success: false, message: "No new password provided!"})}
        if (newPassword.length < 5) {return res.status(400).json({success: false, message: "Password too short!"})}
        if (!userEmail) {return res.status(400).json({success: false, message: "No email provided!"})}

        const user = await User.findOne({email: userEmail})
        if (!user) {return res.status(400).json({success: false, message: "Couldn't find user!"})}

        if (otp !== user.resetOtp || Date.now() > user.resetOtpExpiresAt) {return res.status(400).json({success: false, message: "Invalid or expired otp!"})}

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword
        user.resetOtp = ""
        user.resetOtpExpiresAt = 0
        await user.save()

        return res.status(200).json({success: true, message: "Password reset successfully!"})
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error})
    }
}

module.exports = {register, login, refreshAccessToken, logout, sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword}