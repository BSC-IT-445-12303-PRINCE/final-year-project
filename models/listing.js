const mongoose = require("mongoose");
const review = require("./review.js");
const { number, required, string } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: {
    type: Number,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },

  category:{
    type:String,
    enum:[
        "trending",
        "rooms",
        "iconic",
        "mountains",
        "castles",
        "pools",
        "camping",
        "farms",
        "arctic",
        "domes",
        "boats"
    ],
    required:true,
  },

    review: [
        {
        type: Schema.Types.ObjectId,
        ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async(listing) =>{
    if(listing){
        await review.deleteMany({_id : {$in: listing.review}});
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;