var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
	flash 		= require("connect-flash"),
	passport	= require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seeds"),
	User		= require("./models/user"),
    Comment     = require("./models/comment")

var commentRoutes    = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes		 = require("./routes/index");

// connect to database
var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp";
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

console.log(process.env.DATABASEURL);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//pass in current user info to every route -middleware
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error =  req.flash("error");
	res.locals.success =  req.flash("success");
	next();
})

// requiring routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("server has started")
});