/*
  Requires and main functions
*/
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const uuid = require("uuid-random");
require("dotenv").config();

/*
  Configuration and settings
*/
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || "localhost";
const TASK_HOST = process.env.TASK_HOST || "0.0.0.0:3000";
const INVITE_HOST = process.env.INVITE_HOST || "0.0.0.0:3001";

const TASKS_URL = `http://${TASK_HOST}/api/tasks`;
const INVITES_URL = `http://${INVITE_HOST}/api/invites`;
const BASE_PATH = "/web-api/todos";

/*
  Starting the app and connections
*/
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.listen(PORT, HOST, () => {
  console.log(`App listening on http://${HOST}:${PORT}`);
});

/*
  Utils
*/
const zeroPad = (num, places) => String(Math.floor(num)).padStart(places, "0");

/*
  Routes
*/
/*
  GET all TODOS
*/
app.get(BASE_PATH, (req, res, next) => {
  axios({
    method: "get",
    url: TASKS_URL,
  })
    .then((taskResponse) => {
      axios({
        method: "get",
        url: INVITES_URL,
      })
        .then((invitesResponse) => {
          const tasks = taskResponse.data.map((task) => {
            return {
              todoId: task.id,
              todoDesc: task.title,
              type: "tasks",
            };
          });
          const invites = invitesResponse.data.map((invite) => {
            return {
              todoId: invite.inviteId,
              todoDesc: invite.inviteTitle,
              type: "invites",
            };
          });

          res.send([...tasks, ...invites]);
        })
        .catch((error) => {
          res.send([]);
        });
    })
    .catch((error) => {
      res.send([]);
    });
});

/*
  GET a specific todo
*/
app.get(`${BASE_PATH}/:type/:todoid`, (req, res, next) => {
  if (req.params.type === "tasks") {
    axios({
      method: "get",
      url: `${TASKS_URL}/${req.params.todoid}`,
    })
      .then((taskResponse) => {
        const result = {
          todoId: taskResponse.data.id,
          todoDesc: taskResponse.data.title,
          todoLongDesc: taskResponse.data.description,
          contact: taskResponse.data.contact,
          when: taskResponse.data.when,
        }
        res.send(result);
      })
      .catch((error) => {
        res.send();
      });
  } else {
    axios({
      method: "get",
      url: `${INVITES_URL}/${req.params.todoid}`,
    })
      .then((taskResponse) => {
        const result = {
          todoId: taskResponse.data.inviteId,
          todoDesc: taskResponse.data.inviteTitle,
          todoLongDesc: taskResponse.data.eventDescription,
          contact: taskResponse.data.email,
          when: taskResponse.data.date,
        }
        res.send(result);
      })
      .catch((error) => {
        res.send();
      });
  }
});

/*
  DELETE a TODO
*/
app.delete(`${BASE_PATH}/:type/:todoid`, (req, res, next) => {
  if (req.params.type === "tasks") {
    axios({
      method: "delete",
      url: `${TASKS_URL}/${req.params.todoid}`,
    })
      .then((taskResponse) => {
        res.send(taskResponse.data);
      })
      .catch((error) => {
        res.send();
      });
  } else {
    axios({
      method: "delete",
      url: `${INVITES_URL}/${req.params.todoid}`,
    })
      .then((taskResponse) => {
        res.send(taskResponse.data);
      })
      .catch((error) => {
        res.send();
      });
  }
});

/*

*/
app.post(`${BASE_PATH}/:type/`, (req, res, next) => {
  if (req.params.type === "tasks") {
    axios({
      method: "post",
      url: TASKS_URL,
      data: {
        id: req.body.todoId || uuid(),
        title: req.body.todoDesc,
        description: req.body.todoLongDesc,
        responsible: req.body.contact,
        deadLine: req.body.when,
      },
    })
      .then((taskResponse) => {
        res.send(taskResponse.data);
      })
      .catch((error) => {
        res.send();
      });
  } else {
    axios({
      method: "post",
      url: INVITES_URL,
      data: {
        inviteId: req.body.todoId || zeroPad(Math.random() * 999999, 6),
        inviteTitle: req.body.todoDesc,
        eventDescription: req.body.todoLongDesc,
        email: req.body.contact,
        date: req.body.when,
      },
    })
      .then((taskResponse) => {
        res.send(`${taskResponse.data}`);
      })
      .catch((error) => {
        res.send();
      });
  }
});

/* 
  Queue POC
*/

const redis = require("redis");
const Queue = require("bee-queue");
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PREFIX = (process.env.REDIS_PREFIX || "queue") + ":";
const redisClient = redis.createClient(REDIS_PORT, REDIS_HOST, {
  prefix: REDIS_PREFIX,
});
const pocQueue = new Queue("poc", {
  redis: redisClient,
});
pocQueue.process(async (job) => {
  console.log(`Processing job ${job.id}`);
  return job.data.x + job.data.y;
});

app.post(`${BASE_PATH}/poc/:x/:y`, (req, res, next) => {
  const pocJob = pocQueue.createJob({ x: req.params.x, y: req.params.y });
  pocJob
    .timeout(3000)
    .retries(2)
    .save()
    .then((job) => {
      res.send("OK");
    });
});
