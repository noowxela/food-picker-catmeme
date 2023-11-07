const httpStatus = require('http-status');
const { Booking } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a booking
 * @param {Object} bookingBody
 * @returns {Promise<Booking>}
 */
const createBooking = async (bookingBody) => {
  return Booking.create(bookingBody);
};

/**
 * Query for bookings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBookings = async (filter, options) => {
  if (filter['name']) {
    filter['name'] = { $regex: filter.name, $options: 'i' };
  }

  if (filter['address']) {
    filter['address'] = { $regex: filter.address, $options: 'i' };
  }

  if (filter['category']) {
    filter['category'] = { $regex: filter.category, $options: 'i' };
  }

  const bookings = await Booking.paginate(filter, options);
  return bookings;
};

/**
 * Get booking by id
 * @param {ObjectId} id
 * @returns {Promise<Booking>}
 */
const getBookingById = async (id) => {
  return Booking.findById(id);
};

/**
 * Get booking by email
 * @param {string} email
 * @returns {Promise<Booking>}
 */
const getBookingByEmail = async (email) => {
  return Booking.findOne({ email });
};

/**
 * Update booking by id
 * @param {ObjectId} bookingId
 * @param {Object} updateBody
 * @returns {Promise<Booking>}
 */
const updateBookingById = async (bookingId, updateBody) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  if (updateBody.name && (await Booking.isNameTaken(updateBody.name, bookingId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(booking, updateBody);
  await booking.save();
  return booking;
};

/**
 * Delete booking by id
 * @param {ObjectId} bookingId
 * @returns {Promise<Booking>}
 */
const deleteBookingById = async (bookingId) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  await booking.remove();
  return booking;
};

module.exports = {
  createBooking,
  queryBookings,
  getBookingById,
  getBookingByEmail,
  updateBookingById,
  deleteBookingById,
};
