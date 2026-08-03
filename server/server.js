require("dotenv").config()
const path = require("path")
const express = require("express")
const app = express()
const authRoutes = require("./routes/authRoutes")
const linkRoutes = require("./routes/linkRoutes")
const userRoutes = require("./routes/userRoutes")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const port = process.env.PORT || 3000
const isProduction = process.env.NODE_ENV === "production"
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", process.env.CLIENT_ORIGIN].filter(Boolean)

app.set("trust proxy", 1)

// connect to database
require("./config/mongo")()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }
        callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))

// routes
app.use("/api/auth", authRoutes)
app.use("/api/links", linkRoutes)
app.use("/api/user", userRoutes)

if (isProduction) {
    app.use(express.static(path.join(__dirname, "../client/dist")))
    app.get("/*splat", (req, res) => {
        res.sendFile(path.join(__dirname, "../client/dist/index.html"))
    })
}

app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}!`)
})