const Link = require("../models/redirectLink")
const User = require("../models/user")

const getAllLinksForUser = async (req, res) => {
    try {
        const userData = req.userData

        const user = await User.findById(userData.userId)
        if (!user) {return res.status(400).json({success: false, message: "User not found!"})}

        const links = await Link.find({userId: userData.userId})
        if (links.length === 0) {return res.status(400).json({success: false, message: "No links found for this user!"})}
        
        return res.status(200).json({success: true, message: "Links fetched successfully!", links})
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error: error.errmsg || error})
    }
}

const getOneLink = async (req, res) => {
    try {
        const userData = req.userData
        const linkId = req.params.id

        const user = await User.findById(userData.userId)
        if (!user) {return res.status(400).json({success: false, message: "User not found!"})}

        const link = await Link.findOne({userId: userData.userId, _id: linkId})
        if (!link) {return res.status(400).json({success: false, message: "No link found for this user with this id!"})}
        
        return res.status(200).json({success: true, message: "Link found successfully!", link})
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error: error.errmsg || error})
    }
}

const createLink = async (req, res) => {
    try {
        const userData = req.userData
        const {name, redirectTo} = req.body || {}

        if (!name || !redirectTo) {return res.status(400).json({success: false, message: "Name and redirectTo (url) are mandatory!"})}

        const link = await Link.create({userId: userData.userId, name, redirectTo})
        if (!link) {return res.status(400).json({success: false, message: "Couldn't create link!"})}

        return res.status(201).json({success: true, message: "Link created successfully!", link})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Something went wrong!", error: error.errmsg || error})
    }
}

const updateLink = async (req, res) => {
    try {
        const userData = req.userData
        const linkId = req.params.id
        const {name, redirectTo} = req.body

        const user = await User.findById(userData.userId)
        if (!user) {return res.status(400).json({success: false, message: "User not found!"})}

        const link = await Link.findOne({userId: userData.userId, _id: linkId})
        if (!link) {return res.status(400).json({success: false, message: "No link found for this user with this id!"})}

        if (!name && !redirectTo) {return res.status(400).json({success: false, message: "No name or link provided ot update with!"})}
        if (name) {link.name = name}
        if (redirectTo) {link.redirectTo = redirectTo}
        link.save()
        
        return res.status(200).json({success: true, message: "Link updated successfully!", link})
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error: error.errmsg || error})
    }
}


const deleteLink = async (req, res) => {
    try {
        const userData = req.userData
        const linkId = req.params.id

        const user = await User.findById(userData.userId)
        if (!user) {return res.status(400).json({success: false, message: "User not found!"})}

        const link = await Link.findOneAndDelete({userId: userData.userId, _id: linkId})
        if (!link) {return res.status(400).json({success: false, message: "No link found for this user with this id!"})}
        
        return res.status(200).json({success: true, message: "Link deleted successfully!", link})
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error: error.errmsg || error})
    }
}

const redirectById = async (req, res) => {
    try {
        const linkId = req.params.id

        const link = await Link.findById(linkId)
        if (!link) {return res.status(400).json({success: false, message: "No link found for this id!"})}

        link.visited = link.visited + 1
        link.save()
        
        return res.status(200).redirect(link.redirectTo)
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error: error.errmsg || error})
    }
}

const getLinkList = async (req, res) => {
    try {
        const userData = req.userData

        const user = await User.findById(userData.userId)
        if (!user) {return res.status(400).json({success: false, message: "User not found!"})}

        const links = await Link.find({userId: userData.userId})
        if (links.length === 0) {return res.status(400).json({success: false, message: "No links found for this user!"})}

        const baseUrl = `${req.protocol}s://${req.get('host')}`;
        linkArray = links.map((link) => (baseUrl + "/api/links/redirect/" + link._id))
        
        return res.status(200).json({success: true, message: "Links listed successfully!", linkArray})
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong!", error: error.errmsg || error})
    }
}

module.exports = {getAllLinksForUser, getOneLink, createLink, updateLink, deleteLink, redirectById, getLinkList}