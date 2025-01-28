const express = require("express");
const recipesRoutes = require("./recipes");
const usersRoutes = require("./users");
const commentsRoutes = require("./comments");
const ratingsRoutes = require("./ratings");

const router = express.Router();

router.use("/recipes", recipesRoutes);
router.use("/users", usersRoutes);
router.use("/comments", commentsRoutes);
router.use("/ratings", ratingsRoutes);

module.exports = router;
