const express = require("express")
const router = express.Router()
const getUserData = require("../controllers/userController")
const  authMiddleware = require("../middleware/authMiddleware")

router.get("/data", authMiddleware, getUserData)

module.exports = router 