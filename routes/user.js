var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Cart = require("../models/cart");
var async = require("async");
var passport = require("passport");
var passportConfig = require("../config/passport");


router.get("/login", function(req, res){
	if(req.user) return res.redirect("/");
	res.render("accounts/login", {message: req.flash("loginMessage")});
});

router.post("/login", passport.authenticate("local-login", {
	successRedirect: "/",
	failureRedirect: "/login",
	failureFlash: true
}), function(req, res){

});

router.get("/profile", function(req, res){
	User.findOne({ _id: req.user._id}, function(err, user){
		if(err) return next(err);

		res.render("accounts/profile", {user: user});

	})
});

router.get("/signup", function(req, res){
	res.render("accounts/signup", {errors: req.flash("errors")});
});

router.post("/signup", function(req, res, next){

	async.waterfall([
		function(callback){
		var user = new User();
		user.profile.name = req.body.firstName + " " + req.body.lastName;
		user.email = req.body.email;
		user.superUser = true;
		user.profile.picture = user.gravatar();
		user.birthdate = new Date(req.body.year + "-" + req.body.month + "-" + req.body.day);
		if(!(req.body.password === req.body.confirmPassword)){
			req.flash("errors", "Your password and confirm password does not match");
			return res.redirect("/signup");
		}
		user.password = req.body.password;
		User.findOne({email : req.body.email}, function(err, existingUser){
		if(existingUser){
			req.flash("errors", "Account with that email address already exist");
			return res.redirect("/signup");
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
				req.logIn(user, function(err){
				return res.redirect("/");
				});
			});
		}
	]);
});

router.get("/logout", function(req, res, next){
	req.logout();
	res.redirect("/");

});

router.get("/edit-profile", function(req, res, next){
	var month = ["January","February","March","April","May","June","July", "August", "September", "October", "November", "December"];
	User.findById(req.user._id, function(err, user){
		if(err) return next(err);
	var getMonth = month[parseInt(user.birthdate.getMonth())];
	res.render("accounts/edit-profile", {message: req.flash("success"), user: user, getMonth: getMonth, errors: req.flash("errors")});
	});
});

router.post("/edit-profile", function(req, res, next){
	User.findOne({_id: req.user._id}, function(err, user){
		if(err) return next(err);

		if(req.body.name) user.profile.name = req.body.name;
		if(req.body.address) user.address = req.body.address;
		if(req.body.month && req.body.day && req.body.year){
			user.birthdate = new Date(req.body.year + "-" + req.body.month + "-" + req.body.day);
		}
		if(!user.comparePassword(req.body.currentPass)){
			req.flash("errors", "You have entered a wrong password");
			return res.redirect("/edit-profile");
		}
		if(!(req.body.password === req.body.confirmPass)){
			req.flash("errors", "Your new password and confirm password does not match");
			return res.redirect("/edit-profile");
		}
		user.password = req.body.password;
		user.save(function(err){
			if(err) return next(err);
			req.flash("success", "You successfully edit your profile");
			return res.redirect("/edit-profile");	
		});
	});
});



module.exports = router;