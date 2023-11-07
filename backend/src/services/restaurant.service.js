const httpStatus = require('http-status');
const { Restaurant } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a restaurant
 * @param {Object} restaurantBody
 * @returns {Promise<Restaurant>}
 */
const createRestaurant = async (restaurantBody) => {
  if (await Restaurant.isNameTaken(restaurantBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  return Restaurant.create(restaurantBody);
};

/**
 * Query for restaurants
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryRestaurants = async (filter, options) => {
  if (filter['name']) {
    filter['name'] = { $regex: filter.name, $options: 'i' };
  }

  if (filter['address']) {
    filter['address'] = { $regex: filter.address, $options: 'i' };
  }

  if (filter['category']) {
    filter['category'] = { $regex: filter.category, $options: 'i' };
  }

  const restaurants = await Restaurant.paginate(filter, options);
  return restaurants;
};

/**
 * Get restaurant by id
 * @param {ObjectId} id
 * @returns {Promise<Restaurant>}
 */
const getRestaurantById = async (id) => {
  return Restaurant.findById(id);
};

/**
 * Get restaurant by email
 * @param {string} email
 * @returns {Promise<Restaurant>}
 */
const getRestaurantByEmail = async (email) => {
  return Restaurant.findOne({ email });
};

/**
 * Update restaurant by id
 * @param {ObjectId} restaurantId
 * @param {Object} updateBody
 * @returns {Promise<Restaurant>}
 */
const updateRestaurantById = async (restaurantId, updateBody) => {
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
  if (updateBody.name && (await Restaurant.isNameTaken(updateBody.name, restaurantId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(restaurant, updateBody);
  await restaurant.save();
  return restaurant;
};

/**
 * Delete restaurant by id
 * @param {ObjectId} restaurantId
 * @returns {Promise<Restaurant>}
 */
const deleteRestaurantById = async (restaurantId) => {
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
  await restaurant.remove();
  return restaurant;
};

module.exports = {
  createRestaurant,
  queryRestaurants,
  getRestaurantById,
  getRestaurantByEmail,
  updateRestaurantById,
  deleteRestaurantById,
};
