<script setup>
import { computed, defineProps } from "vue";

const props = defineProps({
  squareSize: {
    type: Number,
    required: true,
    default: 100,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  fill: {
    type: String,
    default: "red",
  },
  direction: {
    type: String,
    required: true,
    validator: (value) => ["left", "bottom", "right", "top"].includes(value),
  },
  click: {
    type: Function,
    default: () => {},
  },
  hoverBlink: {
    type: Boolean,
    default: false,
  },
});

const LEFT = `${props.x},${props.y} ${props.x + props.squareSize / 2},${props.y + props.squareSize / 2} ${props.x},${props.y + props.squareSize}`;
const BOTTOM = `${props.x},${props.y + props.squareSize} ${props.x + props.squareSize / 2},${props.y + props.squareSize / 2} ${props.x + props.squareSize},${props.y + props.squareSize}`;
const RIGHT = `${props.x + props.squareSize},${props.y} ${props.x + props.squareSize / 2},${props.y + props.squareSize / 2} ${props.x + props.squareSize},${props.y + props.squareSize}`;
const TOP = `${props.x},${props.y} ${props.x + props.squareSize / 2},${props.y + props.squareSize / 2} ${props.x + props.squareSize},${props.y}`;

const pos = computed(() => {
  switch (props.direction) {
    case "left":
      return LEFT;
    case "bottom":
      return BOTTOM;
    case "right":
      return RIGHT;
    case "top":
      return TOP;
    default:
      throw new Error("Invalid direction");
  }
});
</script>

<template>
  <polygon
    :points="pos"
    :fill="fill"
  />
</template>
