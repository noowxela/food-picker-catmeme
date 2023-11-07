const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { restaurantService, bookingService } = require('../services');
const { Booking } = require('../models');

const createRestaurant = catchAsync(async (req, res) => {
  const restaurant = await restaurantService.createRestaurant(req.body);
  res.status(httpStatus.CREATED).send(restaurant);
});

const getRestaurants = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'address', 'category']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await restaurantService.queryRestaurants(filter, options);
  res.send(result);
});

const getRestaurant = catchAsync(async (req, res) => {
  console.log('req.params.restaurantId : ', req.params.restaurantId);
  const restaurant = await restaurantService.getRestaurantById(req.params.restaurantId);
  if (!restaurant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
  res.send(restaurant);
});

const updateRestaurant = catchAsync(async (req, res) => {
  const restaurant = await restaurantService.updateRestaurantById(req.params.restaurantId, req.body);
  res.send(restaurant);
});

const deleteRestaurant = catchAsync(async (req, res) => {
  await restaurantService.deleteRestaurantById(req.params.restaurantId);
  res.status(httpStatus.NO_CONTENT).send();
});

const visitRestaurant = catchAsync(async (req, res) => {
  const restaurant = await bookingService.createBooking({
    restaurant: req.params.restaurantId,
    bookingDate: new Date(),
  });
  res.status(httpStatus.CREATED).send(restaurant);
});

const restaurantHistory = catchAsync(async (req, res) => {
  const result = await Booking.aggregate([
    {
      $lookup: {
        from: 'restaurants', // The name of the restaurants collection
        localField: 'restaurant',
        foreignField: '_id',
        as: 'restaurantInfo',
      },
    },
    {
      $unwind: '$restaurantInfo',
    },
    {
      $sort: { bookingDate: -1 }, // Sort by bookingDate in descending order (latest first)
    },
    {
      $limit: 10, // Limit the results to the latest 10 records
    },
    {
      $project: {
        bookingDate: 1,
        restaurant: {
          id: '$restaurantInfo._id',
          name: '$restaurantInfo.name',
          category: '$restaurantInfo.category',
        },
      },
    },
  ])
    .exec()
    .then((results) => {
      return results;
    })
    .catch((error) => {
      console.error('Error retrieving data:', error);
    });
  res.send(result);
});

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  visitRestaurant,
  restaurantHistory,
};
