var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../models/user");
var Product = require("../models/product");
var Comment = require("../models/comment");

router.get("/product/:id/comments/new", function(req, res){
	Product.findById(req.params.id, function(err, foundProduct){
		if(err){
			console.log(err);
		}
			res.render("comments/new", {product: foundProduct});

	});
});

router.post("/product/:id/comments", function(req, res){
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
				res.redirect("/product/" + foundProduct._id);
			}
		});
		}
	});
});


module.exports = router;
