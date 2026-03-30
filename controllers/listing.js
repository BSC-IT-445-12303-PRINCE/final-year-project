const Listing = require("../models/listing");
const Contact = require("../models/contact");


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
    
    res.render("./listing/show.ejs", { listing });
};

module.exports.createListing = async(req,res)=>{
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    
    // Handle coordinates
    if (req.body.listing.latitude && req.body.listing.longitude) {
        newListing.latitude = parseFloat(req.body.listing.latitude);
        newListing.longitude = parseFloat(req.body.listing.longitude);
    }
    
    // Handle multiple images
    if(req.files && req.files.length > 0){
        newListing.images = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
    }
    
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

    // Get first image for preview (backward compatibility)
    let originalImageUrl = listing.images && listing.images.length > 0 
        ? listing.images[0].url 
        : '';
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("./listing/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res)=>{
    let {id} = req.params;
    
    // Find listing first, then update and save
    let listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    // Update basic fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    listing.category = req.body.listing.category;
    
    // Handle coordinates directly
    if (req.body.listing.latitude !== undefined && req.body.listing.latitude !== '') {
        listing.latitude = parseFloat(req.body.listing.latitude);
    }
    if (req.body.listing.longitude !== undefined && req.body.listing.longitude !== '') {
        listing.longitude = parseFloat(req.body.listing.longitude);
    }
    
    // Handle multiple new images
    if(req.files && req.files.length > 0){
        const newImages = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
        // Add new images to existing ones
        listing.images = [...listing.images, ...newImages];
    }
    
    // Save the updated listing
    await listing.save();
    
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

// ============== CONTACT FORM HANDLER ==============
module.exports.submitContact = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message } = req.body;
        
        const contact = new Contact({
            firstName,
            lastName,
            email,
            phone,
            subject,
            message
        });
        
        await contact.save();
        
        req.flash("success", "Thank you for contacting us! We will get back to you soon.");
        res.redirect("/contact");
    } catch (error) {
        console.error("Error saving contact:", error);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/contact");
    }
};
