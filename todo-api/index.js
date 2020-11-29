/*
  Requires and main functions
*/
const express = require("express");
const redis = require("redis");
const bodyParser = require("body-parser");
require("dotenv").config();

const { buildCheckFunction, validationResult } = require("express-validator");
const checkBody = buildCheckFunction(["body"]);

/*
  Configuration and settings
*/
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PREFIX = (process.env.REDIS_PREFIX || "todo") + ":";
const ENTITY = process.env.TODO_ENTITY || "invites";
const BASE_PATH = `/api/${ENTITY}/`;
/*
  Starting the app and connections
*/
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const redisClient = redis.createClient(REDIS_PORT, REDIS_HOST, {
  prefix: REDIS_PREFIX,
});
app.listen(PORT, HOST, () => {
  console.log(`App listening on http://${HOST}:${PORT}`);
});
const Controller = require(`./${ENTITY}`);
const controller = new Controller(redisClient, checkBody, REDIS_PREFIX);

/*
  Create some entities
*/
controller.createEntities();

/*
  General Functions functions
*/

async function validateRequest(req, res, next) {
  try {
    console.log("Validating request...");
    validationResult(req).throw();
    console.log("Request valid");
    next();
  } catch (error) {
    console.error(JSON.stringify(error.errors));
    res.status(422).json(error.errors);
  }
}

async function delay(req, res, next) {
  const timeToWait = Math.random() * 5000;
  console.log(`Time to wait ${timeToWait}ms`);
  setTimeout(next, timeToWait);
}

async function randomError(req, res, next) {
  const fail = Math.random() * 100;
  if (fail < 5) {
    console.log("This request will fail");
    res.status(405).send("Failed");
  } else {
    next();
  }
}
/*
  Routes
*/
app.post(
  BASE_PATH,
  randomError,
  delay,
  controller.validations(),
  validateRequest,
  controller.save
);
app.get(`${BASE_PATH}:taskid`, randomError, delay, controller.get);
app.get(BASE_PATH, randomError, delay, controller.listAll);
app.delete(`${BASE_PATH}:taskid`, randomError, delay, controller.remove);
