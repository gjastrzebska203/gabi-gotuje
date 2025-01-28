const express = require("express");
const recipesRoutes = require("./recipes");
const usersRoutes = require("./users");
const commentsRoutes = require("./comments");
const authRoutes = require("./auth");

const router = express.Router();

router.use("/recipes", recipesRoutes);
// router.use("/users", usersRoutes);
// router.use("/comments", commentsRoutes);
// router.use("/auth", authRoutes);

module.exports = router;
