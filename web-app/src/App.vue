<template>
  <div id="app">
    <section v-if="errored">
      <p>
        We're sorry, we're not able to retrieve this information at the moment,
        please try back later
      </p>
    </section>
    <section v-else>
      <div v-if="removing">Removing...</div>
      <Todos
        v-bind:todos="todos"
        v-on:delete-todo="deleteTodo"
        v-on:edit-todo="editTodo"
      />
      <div v-if="loading">Loading...</div>
      <AddTodo
        v-bind:todoToEdit="todoToEdit"
        v-on:add-todo="addTodo"
        v-on:cancel-edit-todo="cancelEdit"
      />
      <div v-if="saving">Saving...</div>
    </section>
  </div>
</template>
<script>
import Todos from "./components/Todos";
import AddTodo from "./components/AddTodo";
import axios from "axios";

const WEB_API_ADDRESS = process.env.VUE_APP_WEB_API_URL;
console.log(WEB_API_ADDRESS);

export default {
  name: "app",
  components: {
    Todos,
    AddTodo,
  },
  data() {
    return {
      todos: null,
      loading: true,
      errored: false,
      saving: false,
      removing: false,
      todoToEdit: {
        todoDesc: "",
        todoLongDesc: "",
        contact: "",
        when: "",
        todoId: "",
        type: "",
      },
    };
  },
  mounted() {
    axios
      .get(`${WEB_API_ADDRESS}`)
      .then((response) => {
        this.todos = response.data.map((todo) => {
          todo.loaded = false;
          return todo;
        });
      })
      .catch((error) => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => (this.loading = false));
  },
  methods: {
    addTodo(newTodoObj) {
      this.saving = true;
      axios
        .post(
          `${WEB_API_ADDRESS}/${newTodoObj.type}`,
          newTodoObj
        )
        .then((response) => {
          if (!newTodoObj.todoId) {
            newTodoObj.todoId = response.data;
            newTodoObj.loaded = true;
            this.todos = [...this.todos, newTodoObj];
          } else {
            const todoToEdit = this.todos.find(
              (f) => f.todoId === newTodoObj.todoId
            );
            todoToEdit.todoDesc = newTodoObj.todoDesc;
            todoToEdit.todoLongDesc = newTodoObj.todoLongDesc;
            todoToEdit.contact = newTodoObj.contact;
            todoToEdit.when = newTodoObj.when;
            todoToEdit.type = newTodoObj.type;
            todoToEdit.loaded = true;
          }
          this.todoToEdit.todoDesc = "";
          this.todoToEdit.todoLongDesc = "";
          this.todoToEdit.contact = "";
          this.todoToEdit.when = "";
          this.todoToEdit.type = "";
          this.todoToEdit.todoId = "";
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => (this.saving = false));
    },
    editTodo(todoId) {
      console.info(todoId);

      const todoToEdit = this.todos.find((f) => f.todoId === todoId);
      this.todoToEdit.todoDesc = todoToEdit.todoDesc;
      this.todoToEdit.todoId = todoToEdit.todoId;
      this.todoToEdit.type = todoToEdit.type;
      if (!todoToEdit.loaded) {
        this.loading = true;
        const todoEditRef = this.todoToEdit;
        axios
          .get(
            `${WEB_API_ADDRESS}/${this.todoToEdit.type}/${this.todoToEdit.todoId}`
          )
          .then((response) => {
            todoEditRef.todoLongDesc = response.data.todoLongDesc;
            todoEditRef.contact = response.data.contact;
            todoEditRef.when = response.data.when;
            todoToEdit.loaded = true;
            todoToEdit.todoLongDesc = response.data.todoLongDesc;
            todoToEdit.contact = response.data.contact;
            todoToEdit.when = response.data.when;
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => (this.loading = false));
      } else {
        this.todoToEdit.todoLongDesc = todoToEdit.todoLongDesc;
        this.todoToEdit.contact = todoToEdit.contact;
        this.todoToEdit.when = todoToEdit.when;
        this.todoToEdit.type = todoToEdit.type;
      }
    },
    cancelEdit() {
      this.todoToEdit.todoDesc = "";
      this.todoToEdit.todoLongDesc = "";
      this.todoToEdit.contact = "";
      this.todoToEdit.when = "";
      this.todoToEdit.type = "";
      this.todoToEdit.todoId = "";
    },
    deleteTodo(todoId) {
      const todo = this.todos.find((f) => f.todoId === todoId);
      this.removing = true;
      axios
        .delete(`${WEB_API_ADDRESS}/${todo.type}/${todoId}`)
        .then(() => {
          this.todos = this.todos.filter((todo) => todo.todoId !== todoId);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => (this.removing = false));
    },
  },
};
</script>
<style>
</style>