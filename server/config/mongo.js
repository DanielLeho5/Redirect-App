const mongoose = require("mongoose")

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to Mongo succesfully!")
    } catch (error) {
        console.log("Couldn't connect to MongoDB, error:", error)
        process.exit(1)
    }
}

module.exports = connectToDB