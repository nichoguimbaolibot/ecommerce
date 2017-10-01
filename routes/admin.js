var express = require("express");
var router = express.Router();
var Category = require("../models/category");



router.get("/add-category", function(req, res, next){
	res.render("admin/add-category", {message: req.flash("success"), error: req.flash("error")});
});


router.post("/add-category", function(req, res, next){
	var category = new Category();
	category.name = req.body.name;

	category.save(function(err, category){
		if(err){
			req.flash("error", "The category already exist");
			return res.redirect("/add-category");
		}

		req.flash("success", "Successfully added a category");
		return res.redirect("/add-category");
	});
});


module.exports = router;