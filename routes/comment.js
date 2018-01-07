var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../models/user");
var Product = require("../models/product");
var Comment = require("../models/comment");

function isUserLogin(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("signin", "You must login to do that");
	return res.redirect("/login");
}

router.get("/product/:id/comments/new", isUserLogin, function(req, res){
	Product.findById(req.params.id, function(err, foundProduct){
		if(err){
			console.log(err);
		}
			res.render("comments/new", {product: foundProduct});

	});
});

router.post("/product/:id/comments", isUserLogin, function(req, res){
	Product.findById(req.params.id, function(err, foundProduct){
		if(err){
			console.log(err);
		} else {
		Comment.create(req.body.comment, function(err, comment){
			if(err){
				console.log(err);
			} else{
				comment.author.id = req.user._id;
				comment.author.email = req.user.email;
				comment.save();
				foundProduct.comments.push(comment);
				foundProduct.save();
				console.log(comment);
				console.log(foundProduct);
				console.log(foundProduct.comments);

				return res.redirect("/product/" + foundProduct._id);
			}
		});
		}
	});
});


router.get("/product/:id/comments/:comment_id/edit", function(req, res){
	Comment.findById(req.params.comment_id, function(err, comment){
		if(err) return next(err);
		res.render("comments/edit", {product_id: req.params.id, comment : comment});
	});
});

router.put("/product/:id/comments/:comment_id", function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
		if(err){
			console.log(err);
		} else{
			return res.redirect("/product/" + req.params.id);
		}
	});
});

router.delete("/product/:id/comments/:comment_id", function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err, comment){
		if(err){
			console.log(err);
			res.redirect("back");
		}else {
			return res.redirect("/product/" + req.params.id);
		}
	});
});



module.exports = router;
