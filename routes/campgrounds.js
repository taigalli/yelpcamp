var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware")

//INDEX ROUTE - show all campgrounds
router.get("/", function(req, res) {
	var noMatch = null;
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, function(err, searchedCampgrounds){
			if(searchedCampgrounds.length < 1) {
				var noMatch = "Sorry there are no campgrounds with that name."
			}
			res.render("campgrounds/index", {campgrounds: searchedCampgrounds, noMatch: noMatch});
		});
	} else {
		// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds){
			if (err) {
				console.log(err);
			} else {
				 res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch}); //data + name passing in
			}   
		});
	}
});

//CREATE - add new campgrounds to database
router.post("/", middleware.isLoggedIn, function (req, res){
    // get data from form and add to campgrounds array
    var name= req.body.name;
	var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
   //create a new campground and save to db
   Campground.create(newCampground, function(err, newlyCreated){
      if (err) {
          console.log(err);
      } else {
           // redirect back to campgrounds page
          res.redirect("/campgrounds"); //
      }
   });
});

//NEW - show form to create new campground 
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

//SHOW - shows more info about campground selected - to be declared after NEW to not overwrite
router.get("/:id", function(req, res){
    //find the campground with the provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if (err) {
           console.log(err);
       } else {
		   
		   if(!foundCampground) {
				req.flash("error", "Item not found.");
				return res.redirect("back");
			}
		   
            //render show template with that campground
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		
		if(!foundCampground) {
			req.flash("error", "Item not found.");
			return res.redirect("back");
		}
		
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	})
})
// Regular expression function for search
function escapeRegex(text) {
    return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

module.exports = router;