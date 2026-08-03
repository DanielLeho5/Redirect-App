const jwt = require("jsonwebtoken")

const authMiddleware = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken
        if (!accessToken) {return res.status(401).json({success: false, message: "No access token provided!"})}

        const userData = await jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
        if (!userData) {return res.status(401).json({success: false, message: "Access token is invalid or expired!"})}

        req.userData = userData
        next()
    } catch (error) {
        return res.status(401).json({success: false, message: "Access token is invalid or expired!"})
    }
}

module.exports = authMiddleware