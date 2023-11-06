const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { restaurantService } = require('../services');

const createRestaurant = catchAsync(async (req, res) => {
  const user = await restaurantService.createRestaurant(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getRestaurants = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'address', 'category']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await restaurantService.queryRestaurants(filter, options);
  res.send(result);
});

const getRestaurant = catchAsync(async (req, res) => {
  console.log('req.params.restaurantId : ', req.params.restaurantId);
  const user = await restaurantService.getRestaurantById(req.params.restaurantId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
  res.send(user);
});

const updateRestaurant = catchAsync(async (req, res) => {
  const user = await restaurantService.updateRestaurantById(req.params.restaurantId, req.body);
  res.send(user);
});

const deleteRestaurant = catchAsync(async (req, res) => {
  await restaurantService.deleteRestaurantById(req.params.restaurantId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
