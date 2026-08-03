const jwt = require("jsonwebtoken")

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

const createAccessToken = (user) => {
    return jwt.sign(
        {userId: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified},
        JWT_ACCESS_SECRET,
        {expiresIn: "30m"}
    )
}

const createRefreshToken = (user) => {
    return jwt.sign(
        {userId: user._id},
        JWT_REFRESH_SECRET,
        {expiresIn: "15d"}
    )
}

const cookieOtpions = {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
}

const setAuthCookie = (res, accessToken, refreshToken) => {

    res.cookie("accessToken", accessToken, {
        ...cookieOtpions,
        maxAge: 30 * 60 * 1000
    })

    res.cookie("refreshToken", refreshToken, {
        ...cookieOtpions,
        path: "/api/auth",
        maxAge: 15 * 24 * 60 * 60 * 1000
    })
}

const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", cookieOtpions)
    res.clearCookie("refreshToken", {...cookieOtpions, path: "/api/auth"})
}

module.exports = {createAccessToken, createRefreshToken, setAuthCookie, clearAuthCookies}