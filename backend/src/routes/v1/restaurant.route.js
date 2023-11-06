const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const restaurantValidation = require('../../validations/restaurant.validation');
const restaurantController = require('../../controllers/restaurant.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageRestaurants'), validate(restaurantValidation.createRestaurant), restaurantController.createRestaurant)
  .get(auth('getRestaurants'), validate(restaurantValidation.getRestaurants), restaurantController.getRestaurants);

router
  .route('/:restaurantId')
  .get(auth('getRestaurants'), validate(restaurantValidation.getRestaurant), restaurantController.getRestaurant)
  .patch(auth('manageRestaurants'), validate(restaurantValidation.updateRestaurant), restaurantController.updateRestaurant)
  .delete(auth('manageRestaurants'), validate(restaurantValidation.deleteRestaurant), restaurantController.deleteRestaurant);

module.exports = router;
