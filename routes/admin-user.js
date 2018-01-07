var express = require("express");
var router = express.Router();
var Category = require("../models/category");
var Product = require("../models/product");
var User = require("../models/user");
var Cart = require("../models/cart");
var History = require("../models/history");
var async = require("async");
var passport = require("passport");
var passportConfig = require("../config/passport");

function adminAuthentication(req, res, next){
	if(req.isAuthenticated()){

		if(req.user.isAdmin || req.user.superUser){
			return next();
		} else{
			return res.redirect("back");
		}
	} else{
		return res.redirect("/login");
	}
	
}

function userPaginate(req, res, next){
		var perPage = 9;
		var page = req.params.page;
		User
		.find({superUser: false})
		.skip( perPage * page)
		.limit( perPage )
		.exec(function(err, users){
				if(err) return next(err);
			User.count().exec(function(err, count){
				if(err) return next(err);
				res.render("admin/users", {
					users: users,
					pages: count / perPage
				});

			});
		});
}

router.get("/backup", adminAuthentication, function(req, res, next){
	var _dbConnectionURL = "mongodb://localhost/ecommerce";
	var date = new Date();
	var dateNow = date.toString();
	console.log(dateNow);
	backup({
		uri: _dbConnectionURL,
		root: '/var/www/html/nodejs/ecommerce/backup',
		tar: Date.now() + '.tar',
		callback: function(err){
			if(err){
				console.log(err);

			} else{
				console.log("finish");
				res.redirect("/users");
			}
		}
	});
});

router.get("/users", adminAuthentication, function(req, res, next){
	if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // User.find({name: regex, superUser: false}, function(err, users){
    //   if(err){
    //     console.log(err);
    //    return res.redirect("/users");
    //   }
    //   else{
    //     res.render("admin/users", {users : users});
    //   }
    // });
    var perPage = 9;
		var page = req.params.page;
		User
		.find({"superUser": false, "profile.name": regex})
		.skip( perPage * page)
		.limit( perPage )
		.exec(function(err, users){
				if(err) return next(err);
			User.count().exec(function(err, count){
				if(err) return next(err);
				res.render("admin/users", {
					users: users,
					pages: count / perPage
				});

			});
		});
	}
	else if(req.query.dateb || req.query.datef || req.query.sort){
		if(req.query.sort === "name"){
			var perPage = 9;
		var page = req.params.page;
		User
		.find({superUser: false})
		.sort({"profile.name": 1})
		.skip( perPage * page)
		.limit( perPage )
		.exec(function(err, users){
				if(err) return next(err);
			User.count().exec(function(err, count){
				if(err) return next(err);
				res.render("admin/users", {
					users: users,
					pages: count / perPage
				});

			});
		});
		} else if(req.body.sort === "email"){
			var perPage = 9;
		var page = req.params.page;
		User
		.find({superUser: false})
		.sort({"email": 1})
		.skip( perPage * page)
		.limit( perPage )
		.exec(function(err, users){
				if(err) return next(err);
			User.count().exec(function(err, count){
				if(err) return next(err);
				res.render("admin/users", {
					users: users,
					pages: count / perPage
				});

			});
		});
		} else{
			var perPage = 9;
		var page = req.params.page;
		User
		.find({superUser: false})
		.skip( perPage * page)
		.limit( perPage )
		.exec(function(err, users){
				if(err) return next(err);
			User.count().exec(function(err, count){
				if(err) return next(err);
				res.render("admin/users", {
					users: users,
					pages: count / perPage
				});

			});
		});
		}
  	} 
  	else{
	userPaginate(req, res, next);
	}
});

router.get("/users/page/:page", adminAuthentication, function(req, res, next){
	userPaginate(req, res, next);
});

router.get("/users/new", adminAuthentication, function(req, res, next){
		res.render("admin/users-new", {errors: req.flash("errors")});
});

router.post("/users", adminAuthentication, function(req, res, next){
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

// router.post("/users1", adminAuthentication, function(req, res, next){
// 	async.waterfall([
// 		function(callback){
// 		var letters = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()+?~'"
// 		var length = letters.length;
// 		var randomString = "";
// 		for(var i = 0; i < 8; i++){
// 			var randomize = Math.floor(Math.random() * 50);
// 			var randomizeDecimal = randomize.toFixed(2);
// 			randomString += letters.substring(randomize, randomize - 1);
// 		}
// 		var user = new User();
// 		var number = Math.random() * 10;
// 		var number1 = number.toFixed(2);
// 		user.profile.name = req.body.firstName + " " + req.body.lastName;
// 		user.email = req.body.firstName.substring(0,1) + req.body.middleName.substring(0, 1) + "." + req.body.lastName.substring(0, 1) + number1;
// 		user.profile.picture = user.gravatar();
// 		user.birthdate = new Date(req.body.year + "-" + req.body.month + "-" + req.body.day);
// 		if(req.body.admin === "true"){
// 			user.isAdmin = true;
// 		} else{
// 			user.isAdmin = false;
// 		}
// 		user.password = randomString;
// 		user.getPassword = randomString;
// 		User.findOne({email : req.body.email}, function(err, existingUser){
// 		if(existingUser){
// 			req.flash("errors", "Account with that email address already exist");
// 			return res.redirect("/users/new1");
// 		} else{
// 			user.save(function(err, user){
// 				if(err) return next(err);
// 				console.log(user);
// 				callback(null, user);
// 			});
// 		}
// 	});
// 		},
// 		function(user){
// 			var cart = new Cart();
// 			cart.owner = user._id;
// 			cart.save(function(err){
// 				if(err) return next(err);
// 				res.redirect("/users");
// 			});
// 		}
// 	]);
// });

router.get("/users/:id", adminAuthentication, function(req, res, next){
	async.waterfall([
		function(callback){
			User
			.findById({_id: req.params.id})
			.populate('history')
			.exec(function(err, user){
				if(err) return next(err);
				console.log(user);
				callback(null, user);
			});
		}, function(user){
			History
			.find({customer: user.email})
			.populate('item')
			.exec(function(err, history){
				if(err){
					console.log(err);
				} 
				res.render('admin/profile', {user: user, history: history});
			});
		}
		]);
});

router.delete("/users/:id", adminAuthentication, function(req, res, next){
	User.findByIdAndRemove(req.params.id, function(err, user){
		if(err){
			console.log(err);
		} else{
			return res.redirect("/users");
		}
	});
});

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;