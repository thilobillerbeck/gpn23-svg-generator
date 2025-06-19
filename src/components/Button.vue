<template>
  <button>
    <component
      :is="icon"
      class="pre-icon"
    />
    {{ label }}
  </button>
</template>

<script setup>
const model = defineModel();

defineProps({
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
button {
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 2px solid #ccc;
  padding: 0.5rem 1rem;
  position: relative;
  background-color: transparent;
  color: white;
}
button:hover {
  background-color: #444;
}
.active:hover {
  background-color: #006600;
}
.pre-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
  color: white;
}
</style>
