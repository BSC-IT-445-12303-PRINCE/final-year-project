const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.string().required(),
        latitude: Joi.number().allow('', null),
        longitude: Joi.number().allow('', null),
        image: Joi.string().allow("", null),
        images: Joi.array().items(Joi.object({
            url: Joi.string(),
            filename: Joi.string()
        }))
    }).required().unknown(true)
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        Comment: Joi.string().required(),
    }).required(),
});