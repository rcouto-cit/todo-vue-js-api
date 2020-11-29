<template>
  <div>
    <h2>My todolist</h2>
    <ul>
      <li v-bind:key="todo.id" v-for="todo in todos">
        <Todo
          v-bind:todo="todo"
          v-on:delete-todo="$emit('delete-todo', todo.todoId)"
          v-on:edit-todo="$emit('edit-todo', todo.todoId)"
        />
      </li>
    </ul>
  </div>
</template>
<script>
import Todo from "./Todo";
export default {
  name: "Todos",
  components: {
    Todo,
  },
  props: ["todos"],
};
</script>
<style scoped></style>
