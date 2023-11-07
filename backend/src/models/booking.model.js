const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const bookingSchema = mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant', // Reference to the Restaurant model
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
bookingSchema.plugin(toJSON);
bookingSchema.plugin(paginate);

/**
 * @typedef Restaurant
 */
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
