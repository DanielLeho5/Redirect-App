require("dotenv").config()
const express = require("express")
const app = express()
const authRoutes = require("./routes/authRoutes")
const linkRoutes = require("./routes/linkRoutes")
const cookieParser = require("cookie-parser")

const port = process.env.PORT || 3000

// connect to database
require("./config/mongo")()

app.use(express.json())
app.use(cookieParser())

// routes
app.use("/api/auth", authRoutes)
app.use("/api/links", linkRoutes)

app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}!`)
})