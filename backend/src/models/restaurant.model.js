const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
restaurantSchema.plugin(toJSON);
restaurantSchema.plugin(paginate);

/**
 * Check if name is taken
 * @param {string} name - The restaurant's name
 * @param {ObjectId} [excludeRestaurantId] - The id of the restaurant to be excluded
 * @returns {Promise<boolean>}
 */
restaurantSchema.statics.isNameTaken = async function (name, excludeRestaurantId) {
  const restaurant = await this.findOne({ name, _id: { $ne: excludeRestaurantId } });
  return !!restaurant;
};

/**
 * @typedef Restaurant
 */
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
