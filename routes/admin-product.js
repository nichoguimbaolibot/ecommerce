var express = require("express");
var router = express.Router();
var multer = require("multer");
var Category = require("../models/category");
var Product = require("../models/product");
var User = require("../models/user");
var Cart = require("../models/cart");
var History = require("../models/history");
var async = require("async");
var passport = require("passport");
var passportConfig = require("../config/passport");

var filename;
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/images");
    },
    filename: function (req, file, callback) {
    	filename = file.fieldname + "_" + Date.now() + "_" + file.originalname;
        callback(null, filename);
    }
});

var upload = multer({ storage: Storage }).array("image", 1); //Field name and max count

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

router.get("/add-category", adminAuthentication, function(req, res, next){
	res.render("admin/add-category", {message: req.flash("success"), error: req.flash("error")});
});


router.post("/add-category", adminAuthentication, function(req, res, next){
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

router.get("/edit-category/:id", adminAuthentication, function(req, res, next){
	Category.findById(req.params.id, function(err, category){
		if(err) return next(err);
	res.render("admin/edit-category", {category: category});
});
});

router.put("/edit-category/:id", adminAuthentication, function(req, res, next){
	Category.findByIdAndUpdate(req.params.id, req.body.category, function(err, product){
		if(err) return next(err);
		return res.redirect("/product");
	});
});

router.delete("/edit-category/:id", adminAuthentication, function(req, res, next){
	Category.findByIdAndRemove(req.params.id, function(err, product){
		if(err) return next(err);
		return res.redirect("/product");
	});
});

router.get("/product", adminAuthentication, function(req, res, next){
	if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    var perPage = 9;
		var page = req.params.page;
		Product
		.find({name: regex})
		.skip( perPage * page)
		.limit( perPage )
		.populate("category")
		.exec(function(err, product){
				if(err) return next(err);
			Product.count({name: regex}).exec(function(err, count){
				if(err) return next(err);
				res.render("admin/product", {
					product: product,
					pages: count / perPage
				});

			});
		});
  } else{
	paginate(req, res, next);
}
});

router.get("/product/page/:page", function(req, res, next){
	paginate(req, res, next);
});

router.get("/product/admin/:id", adminAuthentication, function(req, res,next){
	Product.findById(req.params.id, function(err, product){
		if(err) return next(err);
		res.render("admin/product-show", {product: product});
	});
});

router.delete("/product/:id", adminAuthentication, function(req, res, next){
	Product.findByIdAndRemove(req.params.id, function(err, product){
		if(err){
			console.log(err);
		} else{
			req.flash("signin", "Successfully deleted an item");
			return res.redirect("/product");
		}
	});
});

router.get("/product/admin/:id/edit", adminAuthentication, function(req, res, next){
	Product
	.findByIdAndUpdate(req.params.id)
	.populate("category")
	.exec(function(err, product){
		if(err) return next(err);
		res.render("admin/product-edit", {product: product});
	});
	
});


router.put("/product/admin/:id", adminAuthentication, function(req, res, next){
	
	if(req.body.category && req.body.name && req.body.price){
			var newProduct = {
			category : req.body.category,
			name: req.body.name,
			price: parseFloat(req.body.price),
		};

		Product.findByIdAndUpdate(req.params.id, newProduct, function(err, product){
			if(err){
				console.log(err);
			} else{
				console.log(product);
				req.flash("signin", "successfully edited an item");
				return res.redirect("/product/admin/" + req.params.id + "/edit/image");
			}
		});
	} else{
		req.flash("signin", "You leave an empty field");
		return res.redirect("/product/admin/" + req.params.id + "/edit/image");
	}

});

router.get("/product/admin/:id/edit/image", adminAuthentication, function(req, res, next){
	Product
	.findByIdAndUpdate(req.params.id)
	.populate("category")
	.exec(function(err, product){
		if(err) return next(err);
		res.render("admin/product-upload", {product: product});
	});
	
});

router.get("/history", function(req, res, next){
	History
	.find()
	.populate('item')
	.exec(function(err, history){
		if(err){
			console.log(err);
		} 
		res.render("admin/history", {history : history});
	});
	
});



function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}




module.exports = router;