const Listing = require("../models/listing");


module.exports.index = async (req, res) => {
  let { search, category } = req.query;

  let query = {};

  // 🔍 Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } }
    ];
  }

  // 🏷 Category filter
  if (category) {
    query.category = category;
  }

  const allListings = await Listing.find(query);

  const categories = await Listing.distinct("category");

  const categoryIcons = {
  trending: "fa-solid fa-fire",
  rooms: "fa-solid fa-bed",
  iconic: "fa-solid fa-city",
  mountains: "fa-solid fa-mountain",
  castles: "fa-solid fa-chess-rook",
  pools: "fa-solid fa-water-ladder",
  camping: "fa-solid fa-campground",
  farms: "fa-solid fa-tractor",
  arctic: "fa-solid fa-snowflake",
  domes: "fa-solid fa-igloo",
  boats: "fa-solid fa-ship",
};


  res.render("listing/index", { allListings, categories, selectedCategory: category, categoryIcons });
};



module.exports.renderNewForm =  (req,res) =>{
    res.render("./listing/new.ejs");
};

module.exports.showListing = async(req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"review", populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error", "Listing You requested for dose not exist");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("./listing/show.ejs", { listing });
};

module.exports.createListing = async(req,res)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing You requested for dose not exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("./listing/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Updated Listing!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
