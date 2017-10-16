var express = require("express");
var router = express.Router();
var Category = require("../models/category");
var Product = require("../models/product");
var User = require("../models/user");
var Cart = require("../models/cart");
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

function paginate(req, res, next){
		var perPage = 9;
		var page = req.params.page;
		Product
		.find()
		.skip( perPage * page)
		.limit( perPage )
		.populate("category")
		.exec(function(err, product){
				if(err) return next(err);
			Product.count().exec(function(err, count){
				if(err) return next(err);
				res.render("admin/product", {
					product: product,
					pages: count / perPage
				});

			});
		});
}

router.get("/users", adminAuthentication, function(req, res, next){
	if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    User.find({name: regex, superUser: false}, function(err, users){
      if(err){
        console.log(err);
       return res.redirect("/users");
      }
      else{
        res.render("admin/users", {users : users});
      }
    });
  } else{
	User.find({superUser: false}, function(err, users){
		if(err){
			console.log(err);
		} 
		res.render("admin/users", {users : users});
	});
	}
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

router.get("/users/:id", adminAuthentication, function(req, res, next){
	User.findById(req.params.id, function(err, user){
		if(err){
			console.log(err);
		} else{
			res.render("admin/profile", {user : user});
		}
	});
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