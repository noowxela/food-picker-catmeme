const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createRestaurant = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    category: Joi.string().required(),
    porkFree: Joi.boolean().default(false),
    walkInOnly: Joi.boolean().default(false),
  }),
};

const getRestaurants = {
  query: Joi.object().keys({
    name: Joi.string(),
    address: Joi.string(),
    category: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRestaurant = {
  params: Joi.object().keys({
    restaurantId: Joi.string().custom(objectId),
  }),
};

const updateRestaurant = {
  params: Joi.object().keys({
    restaurantId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      address: Joi.string(),
      category: Joi.string(),
    })
    .min(1),
};

const deleteRestaurant = {
  params: Joi.object().keys({
    restaurantId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
