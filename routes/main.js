var express = require("express");
var router = express.Router();
var multer = require('multer');
var User = require("../models/user");
var Product = require("../models/product");
var Cart = require("../models/cart");
var Category = require("../models/category");
var History = require("../models/history");
var async = require('async');
var stripe = require("stripe")('sk_test_S62DppIR052fLWCke3QoR0OF');


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

function paginate(req, res, next){
		var perPage = 9;
		var page = req.params.page;
		Product
		.find()
		.skip( perPage * page)
		.limit( perPage )
		.populate("category")
		.exec(function(err, products){
				if(err) return next(err);
			Product.count().exec(function(err, count){
				if(err) return next(err);
				res.render("main/product-main", {
					products: products,
					pages: count / perPage
				});

			});
		});
}

function categoryPaginate(req, res, next){
		var perPage = 9;
		var page = req.params.page;
		Product
		.find({category : req.params.id})
		.skip( perPage * page)
		.limit( perPage )
		.populate("category")
		.exec(function(err, products){
				if(err) return next(err);
		Category.findById(req.params.id, function(err, category){
				if(err) return next(err);
		Product.count({category: req.params.id}).exec(function(err, count){
				if(err) return next(err);
				
				res.render("main/category", {
					products: products,
					category: category,
					pages: count / perPage
					});
				});
			});
		});
}

Product.createMapping(function(err, mapping){
	if(err){
		console.log("error creating mapping");
		console.log(err);
	} else{
		console.log("Mapping created");
		console.log(mapping);
	}
});

var stream = Product.synchronize();
var count = 0;

stream.on("data", function(){
	count++;
});

stream.on("close", function(){
	console.log("Indexed " + count + " documents");
});

stream.on("error", function(err){
	console.log(err)
});

router.get("/", function(req, res, next){
		paginate(req, res, next);
	// }else{
	// res.render("main/home");
 //   }
});

router.get("/cart", isCartAccess, function(req, res, next){
	Cart
	.findOne({owner : req.user._id})
	.populate("items.item")
	.exec(function(err, foundCart){
		if(err) return next(err);
		res.render("main/cart", {
			foundCart: foundCart,
			message: req.flash("remove")
		});
	});
});

router.get("/product/new", function(req, res ,next){
	Category.find({}, function(err, categories){
		if(err){
			console.log(err);
		} else {
			res.render("main/product-new", {categories: categories});
		}
	});
});

router.post("/product", function(req, res, next){
	var price = parseFloat(req.body.price).toFixed(2);
	var newProduct = {
		category: req.body.category,
		name: req.body.name,
		price: price,
	};

	Product.create(newProduct, function(err, product){
		if(err){
			console.log(err);
		} else{
			console.log(product);
			return res.redirect("/product/new/" + product._id);
		}
	});
});

router.get("/product/new/:product_id", function(req, res, next){
	Product.findOne({ _id : req.params.product_id}, function(err, product){
		if(err){
			console.log(err);
		} else{
			return res.render("main/upload", {product: product});
		}

	});
});

router.post("/product/new/:product_id", function(req, res, next){
	Product.findOne({ _id : req.params.product_id}, function(err, product){
		upload(req, res, function(err){
			if(err){
				console.log(err);
			} else{
				product.image = filename;
				console.log("filename: " + product.image);
				product.save(function(err){
					if(err){
						console.log(err);
					} else{
						return res.redirect("/product");
					}
				});
			}
		});
	});
});

router.post("/product/:product_id", function(req, res, next){
	if(req.user._id){
	Product.findById(req.body.product_id, function(err, product){
		console.log("product: " + product);
	Cart.findOne({owner : req.user._id}, function(err, cart){
		cart.items.push({
			item: req.body.product_id,
			price: parseFloat(product.price),
			quantity: parseInt(req.body.quantity)
		});
		cart.total = (cart.total + parseFloat(product.price * req.body.quantity)).toFixed(2);
		cart.save(function(err){
			if(err) return next(err);
			return res.redirect("back");
			});
		});
	});
	} else{
		req.flash("message", "You need to signup in order to do that");
		return res.redirect("/signup");	
	}
});

router.post("/remove", function(req, res, next){
	Cart.findOne({owner : req.user._id}, function(err, foundCart){
		foundCart.items.pull(String(req.body.item));
		foundCart.total = (foundCart.total - (parseFloat(req.body.price) * parseFloat(req.body.quantity)));
		foundCart.save(function(err, found){
			if(err) return next(err);
			console.log(found);
			req.flash("remove", "Successfully removed");
			res.redirect("/cart");
		});
	});
});

router.post("/search", function(req, res){
	res.redirect("/search?q=" + req.body.q);
});

router.get("/search", function(req, res){
	if(req.query.q){
	Product.search({
		query_string: {query: req.query.q}
	}, function(err, results){
		if(err) return next(err);
		var data = results.hits.hits.map(function(hit){
			return hit;
		});
		res.render("main/search-result", {query: req.query.q, data: data});
	});
   }
});


router.get("/page/:page", function(req, res, next){
	paginate(req, res, next);
});

router.get("/about", function(req, res){
	res.render("main/about");
});

router.get("/shipping-policy", function(req, res){
	res.render("main/shipping");
});

router.get("/return-policy", function(req, res){
	res.render("main/return");
});

router.get("/privacy-policy", function(req, res){
	res.render("main/privacy");
});

router.get("/terms-condition", function(req, res){
	res.render("main/terms");
});

router.get("/payment-methods", function(req, res){
	res.render("main/payment-methods");
});


router.get("/products/:id", function(req, res, next){
	// Product
	// .find({ category: req.params.id})
	// .populate("category")
	// .exec(function(err, products){
	// 	if(err) return next(err);
	// 	console.log(products);
	// 	Category.findById(req.params.id, function(err, category){
	// 		if(err) return next(err);
	// 	res.render("main/category", {products: products, category: category});
	// 	});
	// });

	categoryPaginate(req, res, next);
});

router.get("/products/:id/page/:page", function(req, res, next){
	categoryPaginate(req, res, next);
});


router.get("/product/:id", function(req, res, next){
	Product
	.findById({_id :req.params.id})
	.populate("comments")
	.exec(function(err, product){
		if(err){
			console.log(err);
		}
		res.render("main/product", {product : product});
	});
	// Product.findById({_id: req.params.id}, function(err, product){
	// 	if(err) return next(err);
	// });
});

router.post("/payment", isCartAccess, function(req, res, next){
	var stripeToken = req.body.stripeToken;
	var currentCharges = Math.round(req.body.stripeMoney * 100);
	if(req.user.address === undefined){
		req.flash("remove", "You need to have an address to continue the transaction. Please go to your profile settings and provide a full address.")
		return res.redirect("/cart");
	}
	console.log("Token: " + stripeToken);
	stripe.customers.create({
		source: stripeToken
	}).then(function(customer){
			stripe.charges.create({
			amount: currentCharges,
			currency: 'usd',
			customer: customer.id
		});

	}).then(function(charge){
		async.waterfall([
			function(callback){
				Cart.findOne({ owner: req.user._id}, function(err, cart){
					callback(err, cart);
				});
			}, function(cart, callback){
				User.findOne({_id : req.user._id}, function(err, user){
					if(user){
						for(var i = 0; i < cart.items.length; i++) {
							var history = {
								customer: req.user.email,
								item: cart.items[i].item,
								paid: cart.items[i].price
							};
							History.create(history, function(err, history){
							if(err){
								console.log(err);
							}else{
							user.history.push(history);
							console.log(user);
							user.save(function(err, user){
							if(err) return next(err);
							console.log("user: " + user)
						});
							}
						});
							// {
							// 	customer: req.user.email,
							// 	item: cart.items[i].item,
							// 	paid: cart.items[i].price
							// }
						
						}
							callback(err, user);
					}
				});
			}, function(user) {
				Cart.update({ owner: user._id}, {$set: {items: [], total: 0}}, function(err, updated){
					if(updated){
						return res.redirect("/profile");
					}
				});
			}
			]);
	});

});

function isCartAccess(req, res, next){
	if(!(req.isAuthenticated())){
		req.flash("signin", "You need to be login/signup to do that!");
		return res.redirect("/login");
	}
	return next();
}

module.exports = router;