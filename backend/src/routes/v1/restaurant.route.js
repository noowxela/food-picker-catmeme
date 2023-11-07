const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const restaurantValidation = require('../../validations/restaurant.validation');
const restaurantController = require('../../controllers/restaurant.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(restaurantValidation.createRestaurant), restaurantController.createRestaurant)
  .get(validate(restaurantValidation.getRestaurants), restaurantController.getRestaurants);

router.route('/chooseVisit/:restaurantId').post(restaurantController.visitRestaurant);
router.route('/restaurantHistory').get(restaurantController.restaurantHistory);
router.route('/randomRestaurants').get(restaurantController.randomRestaurants);

router
  .route('/:restaurantId')
  .get(validate(restaurantValidation.getRestaurant), restaurantController.getRestaurant)
  .patch(validate(restaurantValidation.updateRestaurant), restaurantController.updateRestaurant)
  .delete(validate(restaurantValidation.deleteRestaurant), restaurantController.deleteRestaurant);

module.exports = router;
