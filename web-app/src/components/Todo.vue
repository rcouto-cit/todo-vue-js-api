<template>
  <div>
    <p>
      <button @click="$emit('delete-todo', todo.todoId)">Delete</button>
      <button @click="$emit('edit-todo', todo.todoId)">Edit</button>
      {{ todo.todoDesc }}
    </p>
  </div>
</template>
<script>
export default {
  name: "Todo",
  props: ["todo"],
};
</script>
<style scoped>
</style>