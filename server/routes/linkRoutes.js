const express = require("express")
const router = express.Router()
const Redirect = require("../models/redirectLink")
const authMiddleware = require("../middleware/authMiddleware")

const {getAllLinksForUser, getOneLink, createLink, updateLink, deleteLink, redirectById, getLinkList} = require("../controllers/linkController")

router.get("/", authMiddleware, getAllLinksForUser)
router.get("/list", authMiddleware, getLinkList)
router.get("/:id", authMiddleware, getOneLink)
router.post("/", authMiddleware, createLink)
router.put("/:id", authMiddleware, updateLink)
router.delete("/:id", authMiddleware, deleteLink)

router.get("/redirect/:id", redirectById)

module.exports = router 