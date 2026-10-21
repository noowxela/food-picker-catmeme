const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  // Express 5: req.query is a getter on the request prototype (so it is not an own property of req),
  // and req.body is undefined when the request has no body. Read each part explicitly instead of pick().
  const object = Object.keys(validSchema).reduce((acc, key) => ({ ...acc, [key]: req[key] ?? {} }), {});
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  // Hand the validated (coerced) values to the controllers, as Object.assign(req, value) did under Express 4.
  // req.query has no setter in Express 5, so shadow the getter with an own data property instead of assigning.
  Object.entries(value).forEach(([key, validated]) => {
    Object.defineProperty(req, key, { value: validated, writable: true, configurable: true, enumerable: true });
  });
  return next();
};

module.exports = validate;
