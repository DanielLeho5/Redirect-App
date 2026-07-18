require("dotenv").config()
const express = require("express")
const app = express()
const authRoutes = require("./routes/authRoutes")
const linkRoutes = require("./routes/linkRoutes")
const userRoutes = require("./routes/userRoutes")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const port = process.env.PORT || 3000

// connect to database
require("./config/mongo")()

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin: ["http://localhost:5173"], credentials: true}))

// routes
app.use("/api/auth", authRoutes)
app.use("/api/links", linkRoutes)
app.use("/api/user", userRoutes)

app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}!`)
})