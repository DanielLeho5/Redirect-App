const User = require("../models/user")

const getUserData = async (req, res) => {
    try {
        const userId = req.userData.userId || null

        const user = await User.findById(userId)

        if (!user) {return res.status(400).json({success: false, message: "No user found with this id!"})}

        return res.status(200).json({
            success: true,
            data: {
                name: user.name,
                isVerified: user.isVerified
            }
        })
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

module.exports = getUserData