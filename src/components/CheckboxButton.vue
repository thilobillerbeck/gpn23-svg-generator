<template>
  <label :class="{ active: model }">
    <CheckboxBlank v-if="!model" class="icon" />
    <CheckboxMarked v-else class="icon" />
    <component :is="icon" class="pre-icon" />
    {{ label }}
    <input v-model="model" type="checkbox" />
  </label>
</template>

<script setup>
import CheckboxBlank from "~icons/mdi/checkbox-blank-outline";
import CheckboxMarked from "~icons/mdi/checkbox-marked";

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
label {
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 2px solid #ccc;
  padding: 0.5rem 1rem;
  position: relative;
}
label:hover {
  background-color: #444;
}
input {
  display: none;
}
.active {
  background-color: #004400;
}
.active:hover {
  background-color: #006600;
}
.icon {
  content: "✓";
  color: white;
  margin-left: 0.5rem;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.8rem;
}
.pre-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
  color: white;
}
</style>
