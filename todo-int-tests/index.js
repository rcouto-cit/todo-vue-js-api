const axios = require("axios");

const TASK_HOST = process.env.TASK_HOST || "0.0.0.0:3000";
const INVITE_HOST = process.env.INVITE_HOST || "0.0.0.0:3001";
const WEB_HOST = process.env.WEB_HOST || "0.0.0.0:3003";

const API_TASKS = `http://${TASK_HOST}/api/tasks`;
const API_INVITES = `http://${INVITE_HOST}/api/invites`;
const API_WEB = `http://${WEB_HOST}/web-api/todos`;

async function execute({ method, url, data }) {
  return new Promise((resolve) => {
    axios({
      method,
      url,
      data,
    })
      .then((result) => {
        console.log(`Method ${method} for ${url} succefully executed`);
        resolve(true);
      })
      .catch((error) => {
        if (error.response && error.response.status === 405) {
          console.log(`Method ${method} for ${url} succefully executed (405)`);
          resolve(true);
        } else {
          console.error(`ERROR: ${error.message}`);
          resolve(false);
        }
        
      });
  });
}

const execs = [
  {
    method: "get",
    url: API_INVITES,
  },
  {
    method: "post",
    url: API_INVITES,
    data: {
      inviteId: "999999",
      inviteTitle: "Teste",
      eventDescription: "Teste",
      email: "rcouto@ciandt.com",
      date: "2020-11-25",
    },
  },
  {
    method: "get",
    url: `${API_INVITES}/999999`,
  },
  {
    method: "delete",
    url: `${API_INVITES}/999999`,
  },
  {
    method: "get",
    url: API_TASKS,
  },
  {
    method: "post",
    url: API_TASKS,
    data: {
      id: "1225318c-2f6c-11eb-adc1-0242ac120004",
      title: "Teste",
      description: "Teste",
      responsible: "rcouto@ciandt.com",
      deadLine: "2020-11-25",
    },
  },
  {
    method: "get",
    url: `${API_TASKS}/1225318c-2f6c-11eb-adc1-0242ac120004`,
  },
  {
    method: "delete",
    url: `${API_TASKS}/1225318c-2f6c-11eb-adc1-0242ac120004`,
  },
  {
    method: "get",
    url: API_WEB,
  },
  {
    method: "post",
    url: `${API_WEB}/invites`,
    data: {
      todoId: "123456",
      todoDesc: "Teste",
      todoLongDesc: "Teste",
      contact: "rcouto@ciandt.com",
      when: "2020-11-25",
    },
  },
  {
    method: "get",
    url: `${API_WEB}/invites/123456`,
  },
  {
    method: "delete",
    url: `${API_WEB}/invites/123456`,
  },
  {
    method: "post",
    url: `${API_WEB}/tasks`,
    data: {
      todoId: "1225318c-2f6c-11eb-adc1-0242ac12000c",
      todoDesc: "Teste",
      todoLongDesc: "Teste",
      contact: "rcouto@ciandt.com",
      when: "2020-11-25",
    },
  },
  {
    method: "get",
    url: `${API_WEB}/tasks/1225318c-2f6c-11eb-adc1-0242ac12000c`,
  },
  {
    method: "delete",
    url: `${API_WEB}/tasks/1225318c-2f6c-11eb-adc1-0242ac12000c`,
  },
];

async function main() {
  console.log(`Tests to execute: ${execs.length}`);
  let success = 0;
  for (let i = 0; i < execs.length; i++) {
    const result = await execute(execs[i]);
    success += result;
  }
  if(execs.length === success) {
    console.log('Good to GO!');
  } else {
    console.error('Something went wrong');
    process.exit(-1);
  }


}

main();
