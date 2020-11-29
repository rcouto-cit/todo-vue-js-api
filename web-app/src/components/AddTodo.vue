<template>
  <div>
    <form @submit="addTodo">
      <p>
        <label>Title: </label>
        <input type="text" v-model="todoToEdit.todoDesc" name="Title" />
      </p>
      <p>
        <label>Description: </label>
        <input
          type="area"
          v-model="todoToEdit.todoLongDesc"
          name="Description"
        />
      </p>
      <p>
        <label>Contact: </label>
        <input type="text" v-model="todoToEdit.contact" name="Contact" />
      </p>
      <p>
        <label>When: </label>
        <input type="text" v-model="todoToEdit.when" name="When" />
      </p>
      <p>
        <label>Type: </label>
        <select id="type" v-model="todoToEdit.type">
          <option value="invites">Invite</option>
          <option value="tasks">Task</option>
        </select>
      </p>
      <p>
        <button type="submit">Save</button>
		<button @click="$emit('cancel-edit-todo')">Cancel</button>
      </p>
    </form>
  </div>
</template>
<script>
export default {
  name: "AddTodo",
  props: ["todoToEdit"],
  methods: {
    addTodo(e) {
      e.preventDefault();
      const newTodoObj = {
        todoDesc: this.todoToEdit.todoDesc,
        todoLongDesc: this.todoToEdit.todoLongDesc,
        contact: this.todoToEdit.contact,
        when: this.todoToEdit.when,
        type: this.todoToEdit.type,
        todoId: this.todoToEdit.todoId,
      };
      this.$emit("add-todo", newTodoObj);
    },
  },
};
</script>
<style scoped>
</style>