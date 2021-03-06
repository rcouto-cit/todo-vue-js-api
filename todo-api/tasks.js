const uuid = require("uuid-random");

module.exports = function Controller(redisClient, checkBody, REDIS_PREFIX) {
  /*
    Specify the request body format for this entity
  */
  function validations() {
    return [
      checkBody("id", "Invalid ID. It requires a UUID value").isUUID(),
      checkBody(
        "title",
        "Invalid title. it requires a string with 5 or plus characters"
      )
        .isString()
        .isLength({ min: 5 }),
      checkBody(
        "description",
        "Invalid description. It requires a string with 5 or plus characters"
      )
        .isString()
        .isLength({ min: 5 }),
      checkBody(
        "responsible",
        "Invalid responsible. It requires a e-mail"
      ).isEmail(),
      checkBody("deadLine", "Invalid deadline. It requires a date").isDate(),
    ];
  }

  /*
    Store the entity
  */
  async function save(req, res) {
    try {
      console.log("Storing data...");
      const task = req.body;

      redisClient.setex(task.id, 3600, JSON.stringify(task));
      console.log("Data storaged...");
      res.status(200).send(task.id);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }

  /*
    Retrieve a specific entity
  */
  async function get(req, res) {
    try {
      console.log("Looking for data...");
      const { taskid } = req.params;
      redisClient.get(taskid, (error, cachedData) => {
        if (error) throw error;
        if (cachedData) {
          console.log("Data found");
          res.send(JSON.parse(cachedData));
        } else {
          console.log("Data not found");
          res.status(404).send("Not Found");
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }

  /*
    Remove a specific entity
  */
  async function remove(req, res) {
    try {
      console.log("Looking for data...");
      const { taskid } = req.params;
      redisClient.del(taskid, (error, response) => {
        if (error) throw error;
        if (response) {
          console.log("Data removed");
          res.send("Task removed");
        } else {
          console.log("Failure");
          res.status(500).send(`Something went wrong ${response}`);
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }

  /*
    Retrieve all the entities
  */
  async function listAll(req, res) {
    try {
      console.info("Getting keys...");
      redisClient.keys(`${REDIS_PREFIX}*`, async function (err, keys) {
        if (err) throw error;
        if (keys) {
          console.info("Creating promisses to get info");
          const getPromisses = keys.map((key) => {
            return new Promise((resolve) => {
              const result = {};
              try {
                const taskId = key.replace(REDIS_PREFIX, "");
                redisClient.get(taskId, (error, cachedData) => {
                  if (error) {
                    result.success = false;
                    result.key = key;
                    result.error = error;
                  }
                  if (cachedData) {
                    result.success = true;
                    result.key = key;
                    result.value = cachedData;
                  } else {
                    result.success = false;
                    result.key = key;
                    result.error = { msg: "Value not found" };
                  }
                  resolve(result);
                });
              } catch (error) {
                result.success = false;
                result.key = key;
                result.error = error;
                resolve(result);
              }
            });
          });
          const data = await Promise.all(getPromisses);
          console.info(`${data.length} tasks found`);
          const resultData = data
            .filter((f) => f.success)
            .map((info) => JSON.parse(info.value));
          console.info(`${resultData.length} tasks to send`);
          res.send(resultData);
        } else {
          console.info("No tasks available");
          res.send([]);
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }

  /*
    Populate the data source with random entities
  */
  function createEntities() {
    for (let index = 0; index < 5; index++) {
      let deadLine = new Date();
      deadLine.setDate(deadLine.getDate() + index);
      const task = {
        id: uuid(),
        title: `Title #${index + 1} (${REDIS_PREFIX})`,
        description: `That's a description for the task #${index + 1}`,
        responsible: `rcouto+${REDIS_PREFIX}${index}@ciandt.com`,
        deadLine: deadLine.toISOString().split("T")[0],
      };
      redisClient.setex(task.id, 3600, JSON.stringify(task));
    }
  }

  return {
    validations,
    save,
    get,
    listAll,
    remove,
    createEntities,
  };
};
