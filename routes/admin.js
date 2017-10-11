var express = require("express");
var router = express.Router();
var Category = require("../models/category");
var Product = require("../models/product");
var User = require("../models/user");
var Cart = require("../models/cart");
var async = require("async");
var passport = require("passport");
var passportConfig = require("../config/passport");



router.get("/add-category", isAdmin, function(req, res, next){
	res.render("admin/add-category", {message: req.flash("success"), error: req.flash("error")});
});


router.post("/add-category", isAdmin, function(req, res, next){
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


router.get("/users", isAdmin, function(req, res, next){
	User.find({superUser: false}, function(err, users){
		if(err){
			console.log(err);
		} 
		res.render("admin/users", {users : users});
	});
});

router.get("/users/new", isAdmin, function(req, res, next){
		res.render("admin/users-new", {errors: req.flash("errors")});
});

router.post("/users", isAdmin, function(req, res, next){
	async.waterfall([
		function(callback){
		var user = new User();
		user.profile.name = req.body.firstName + " " + req.body.lastName;
		user.email = req.body.email;
		user.profile.picture = user.gravatar();
		user.birthdate = new Date(req.body.year + "-" + req.body.month + "-" + req.body.day);
		if(!(req.body.password === req.body.confirmPassword)){
			req.flash("errors", "Your password and confirm password does not match");
			return res.redirect("/users/new");
		}
		if(req.body.admin === "true"){
			user.isAdmin = true;
		} else{
			user.isAdmin = false;
		}

		user.password = req.body.password;
		User.findOne({email : req.body.email}, function(err, existingUser){
		if(existingUser){
			req.flash("errors", "Account with that email address already exist");
			return res.redirect("/users/new");
		} else{
			user.save(function(err, user){
				if(err) return next(err);
				callback(null, user);
			});
		}
	});
		},
		function(user){
			var cart = new Cart();
			cart.owner = user._id;
			cart.save(function(err){
				if(err) return next(err);
				res.redirect("/users");
			});
		}
	]);
});

router.get("/users/:id", isAdmin, function(req, res, next){
	User.findById(req.params.id, function(err, user){
		if(err){
			console.log(err);
		} else{
			res.render("admin/profile", {user : user});
		}
	});
});

router.delete("/users/:id", isAdmin, function(req, res, next){
	User.findByIdAndRemove(req.params.id, function(err, user){
		if(err){
			console.log(err);
		} else{
			return res.redirect("/users");
		}
	});
});

function isAdmin(req, res, next){
	if(req.isAuthenticated){

		if(req.user.isAdmin || req.user.superUser){
			next();
		} else{
			res.redirect("back");
		}
	} else{
		res.redirect("/login");
	}
}

module.exports = router;