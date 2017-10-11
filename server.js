var express = require("express");
var app = express();
var morgan = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var ejsMate = require("ejs-mate");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("express-flash");
var MongoStore = require("connect-mongo")(session);
var passport = require("passport");
var methodOverride = require("method-override");


var secret = require("./config/secret");
var User = require("./models/user");
var Category = require("./models/category");
var Product = require("./models/product");
var Cart = require("./models/cart");
var cartLength = require("./middlewares/middleware");

mongoose.Promise = global.Promise;
mongoose.connect(secret.database, {useMongoClient: true});

// Middleware
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: secret.secretKey,
	store: new MongoStore({url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});
app.locals.moment = require("moment");
app.use(cartLength);

app.use(function(req, res, next){
	res.locals.signin = req.flash("signin");
	Category.find({}, function(err, categories){
		if(err) return next(err);
		res.locals.categories = categories;
		next();
	});
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

var mainRoutes = require("./routes/main");
var userRoutes = require("./routes/user");
var adminRoutes = require("./routes/admin");
var apiRoutes = require("./api/api");
var commentRoutes = require("./routes/comment");
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use(commentRoutes);
app.use("/api", apiRoutes);


app.listen(secret.port, function(){
	console.log("Server is starting in " + secret.port);
});