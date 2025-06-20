<script setup>
import {
  computed,
  onBeforeMount,
  onMounted,
  onUpdated,
  reactive,
  ref,
} from "vue";
import VueZoomable from "vue-zoomable";
import "vue-zoomable/dist/style.css";
import CheckboxButton from "./components/CheckboxButton.vue";
import Button from "./components/Button.vue";
import Triangle from "./components/graphic/Triangle.vue";

import MdiThemeLightDark from "~icons/mdi/theme-light-dark";
import MdiGradientVertical from "~icons/mdi/gradient-vertical";
import MdiImageOutline from "~icons/mdi/image-outline";
import MdiGrain from "~icons/mdi/grain";
import MdiLens from "~icons/mdi/lens";
import MdiDownload from "~icons/mdi/download";
import MdiUpload from "~icons/mdi/upload";
import MdiDelete from "~icons/mdi/delete";

const width = ref(1020);
const height = ref(1020);
const enableGradient = ref(true);
const enableCA = ref(true);
const enableBackground = ref(true);
const enableGrain = ref(true);
const whiteColors = ref(false);
const abberationIntensity = ref(1);

const squareSize = 100;

const numX = computed(() => Math.ceil(width.value / squareSize) + 1);
const numY = computed(() => Math.ceil(height.value / squareSize) + 1);

const paintSurface = ref({});

function randomGrayColor() {
  const factor = Math.random() / 10 + (whiteColors.value ? 0.75 : 0.05);

  const r = Math.floor(factor * 256);
  const g = Math.floor(factor * 256);
  const b = Math.floor(factor * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function marshallData() {
  return JSON.stringify({
    paintSurface: paintSurface.value,
    squareSize: squareSize,
    height: height.value,
    width: width.value,
    enableGradient: enableGradient.value,
    enableCA: enableCA.value,
    enableBackground: enableBackground.value,
    enableGrain: enableGrain.value,
    whiteColors: whiteColors.value,
    abberationIntensity: abberationIntensity.value,
  });
}

function unmarshallData(raw) {
  const data = JSON.parse(raw);
  paintSurface.value = data.paintSurface;
  height.value = data.height;
  width.value = data.width;
  enableGradient.value = data.enableGradient;
  enableCA.value = data.enableCA;
  enableBackground.value = data.enableBackground;
  whiteColors.value = data.whiteColors ?? false;
  abberationIntensity.value = data.abberationIntensity ?? 1;
}

function saveToLocalStorage() {
  const data = marshallData();
  localStorage.setItem("paint_surface", data);
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem("paint_surface");
  if (raw) unmarshallData(raw);
}

function onPaintSurfaceChange(location) {
  paintSurface.value[location] = !paintSurface.value[location];
  saveToLocalStorage();
}

function generateSVG() {
  const svg = document.getElementById("svg");
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "generated.svg";
  link.click();
}

function downloadJSON() {
  const data = marshallData();
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "paint_surface.json";
  link.click();
}

function importJSON() {
  // trigger file open dialog
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      unmarshallData(event.target.result);
      saveToLocalStorage();
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetPaintSurfac() {
  paintSurface.value = {};
  saveToLocalStorage();
}

onBeforeMount(() => {
  loadFromLocalStorage();
});
</script>

<template>
  <div class="grid">
    <div class="paint-surface">
      <VueZoomable
        style="width: 100%; height: 100%; cursor: grabbing"
        selector="#myContent"
        :min-zoom="0.5"
        :max-zoom="2"
        :wheel-zoom-step="0.05"
        :initial-zoom="0.75"
        :enable-control-button="false"
      >
        <div id="myContent" class="container">
          <svg
            id="svg"
            xmlns="http://www.w3.org/2000/svg"
            :width="width"
            :height="height"
            shape-rendering="crispEdges"
          >
            <defs>
              <radialGradient
                v-if="enableGradient"
                id="gradient"
                cx="50%"
                cy="50%"
                r="140%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stop-color="#000000" stop-opacity="0" />
                <stop offset="100%" stop-color="#000000" stop-opacity="1" />
              </radialGradient>
              <filter id="filmGrain">
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.2"
                  numOctaves="1"
                  seed="10"
                  result="turb"
                />

                <feComponentTransfer in="turb">
                  <feFuncR type="linear" slope="0.2" />
                  <feFuncG type="linear" slope="0.2" />
                  <feFuncB type="linear" slope="0.2" />
                  <feFuncA type="linear" slope="0.15" />
                </feComponentTransfer>
              </filter>
              <filter v-if="enableCA" id="chromatic_aberration">
                <feOffset
                  in="SourceGraphic"
                  result="pre-red"
                  :dx="-8 * abberationIntensity"
                  :dy="4 * abberationIntensity"
                />
                <feOffset in="SourceGraphic" result="pre-green" dx="0" dy="0" />
                <feOffset
                  in="SourceGraphic"
                  result="pre-blue"
                  :dx="8 * abberationIntensity"
                  :dy="-4 * abberationIntensity"
                />
                <feColorMatrix
                  type="matrix"
                  in="pre-red"
                  result="red"
                  values="1 0 0 0 0
                                0 0 0 0 0
                                0 0 0 0 0
                                0 0 0 1 0"
                />
                <feColorMatrix
                  type="matrix"
                  in="pre-green"
                  result="green"
                  values="0 0 0 0 0
                                0 1 0 0 0
                                0 0 0 0 0
                                0 0 0 1 0"
                />
                <feColorMatrix
                  type="matrix"
                  in="pre-blue"
                  result="blue"
                  values="0 0 0 0 0
                                0 0 0 0 0
                                0 0 1 0 0
                                0 0 0 1 0"
                />
                <feBlend
                  mode="screen"
                  in="red"
                  in2="green"
                  result="red_green"
                />
                <feBlend mode="screen" in="red_green" in2="blue" />
              </filter>
            </defs>
            <g
              id="pattern"
              :filter="enableCA.value ?? `url(#chromatic_aberration)`"
            >
              <g id="background">
                <!-- BASE PATTERN -->
                <template v-for="y in numY" :key="y">
                  <template v-for="x in numX" :key="x">
                    <Triangle
                      :square-size="squareSize"
                      :x="x * squareSize - squareSize - squareSize / 2"
                      :y="y * squareSize - squareSize - squareSize / 2"
                      :enabled="true"
                      :class="
                        whiteColors
                          ? 'triangle-overlay-light'
                          : 'triangle-overlay'
                      "
                      direction="left"
                      :fill="
                        enableBackground
                          ? randomGrayColor()
                          : `${whiteColors ? 'white' : 'transparent'}`
                      "
                      @click="onPaintSurfaceChange(`${x},${y},0`)"
                    />
                    <Triangle
                      :square-size="squareSize"
                      :x="x * squareSize - squareSize - squareSize / 2"
                      :y="y * squareSize - squareSize - squareSize / 2"
                      :enabled="true"
                      :class="
                        whiteColors
                          ? 'triangle-overlay-light'
                          : 'triangle-overlay'
                      "
                      direction="bottom"
                      :fill="
                        enableBackground
                          ? randomGrayColor()
                          : `${whiteColors ? 'white' : 'transparent'}`
                      "
                      @click="onPaintSurfaceChange(`${x},${y},1`)"
                    />
                    <Triangle
                      :square-size="squareSize"
                      :x="x * squareSize - squareSize - squareSize / 2"
                      :y="y * squareSize - squareSize - squareSize / 2"
                      :enabled="true"
                      :class="
                        whiteColors
                          ? 'triangle-overlay-light'
                          : 'triangle-overlay'
                      "
                      direction="right"
                      :fill="
                        enableBackground
                          ? randomGrayColor()
                          : `${whiteColors ? 'white' : 'transparent'}`
                      "
                      @click="onPaintSurfaceChange(`${x},${y},2`)"
                    />
                    <Triangle
                      :square-size="squareSize"
                      :x="x * squareSize - squareSize - squareSize / 2"
                      :y="y * squareSize - squareSize - squareSize / 2"
                      :enabled="true"
                      :class="
                        whiteColors
                          ? 'triangle-overlay-light'
                          : 'triangle-overlay'
                      "
                      direction="top"
                      :fill="
                        enableBackground
                          ? randomGrayColor()
                          : `${whiteColors ? 'white' : 'transparent'}`
                      "
                      :ondragend="(e) => e.preventDefault()"
                      :ondragleave="(e) => e.preventDefault()"
                      @click="onPaintSurfaceChange(`${x},${y},3`)"
                    />
                  </template>
                </template>
              </g>
              <g id="foreground">
                <!-- FOREGROUND -->
                <template v-for="y in numY" :key="y">
                  <template v-for="x in numX" :key="x">
                    <Triangle
                      v-if="paintSurface[`${x},${y},0`]"
                      :square-size="squareSize"
                      :x="x * squareSize - squareSize - squareSize / 2"
                      :y="y * squareSize - squareSize - squareSize / 2"
                      direction="left"
                      :fill="whiteColors ? 'black' : 'white'"
                      style="pointer-events: none"
                    />
                    <Triangle
                      v-if="paintSurface[`${x},${y},1`]"
                      :square-size="squareSize"
                      :x="x * squareSize - squareSize - squareSize / 2"
                      :y="y * squareSize - squareSize - squareSize / 2"
                      direction="bottom"
                      :fill="whiteColors ? 'black' : 'white'"
                      style="pointer-events: none"
                    />

                    <Triangle
                      v-if="paintSurface[`${x},${y},2`]"
                      :square-size="squareSize"
                      :x="x * squareSize - squareSize - squareSize / 2"
                      :y="y * squareSize - squareSize - squareSize / 2"
                      direction="right"
                      :fill="whiteColors ? 'black' : 'white'"
                      style="pointer-events: none"
                    />

                    <Triangle
                      v-if="paintSurface[`${x},${y},3`]"
                      :square-size="squareSize"
                      :x="x * squareSize - squareSize - squareSize / 2"
                      :y="y * squareSize - squareSize - squareSize / 2"
                      direction="top"
                      :fill="whiteColors ? 'black' : 'white'"
                      style="pointer-events: none"
                    />
                  </template>
                </template>
              </g>
            </g>
            <rect
              v-if="enableGrain"
              id="grain"
              x="0"
              y="0"
              width="100%"
              height="100%"
              filter="url(#filmGrain)"
              style="pointer-events: none"
            />
            <rect
              v-if="enableGradient"
              id="gradient"
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#gradient)"
              style="pointer-events: none"
            />
          </svg>
        </div>
      </VueZoomable>
    </div>
    <div class="toolbar">
      <h1>GPN 23 Design Generator</h1>

      <p>
        Click on the triangles to toggle their state. The background color can
        be toggled with the checkbox below.
      </p>

      <hr />
      <h2>Features</h2>
      <div class="button-grid">
        <CheckboxButton
          v-model="whiteColors"
          :icon="MdiThemeLightDark"
          label="Invert"
          @update:model-value="() => saveToLocalStorage()"
        />
        <CheckboxButton
          v-model="enableGrain"
          :icon="MdiGrain"
          label="Film Grain"
          @update:model-value="() => saveToLocalStorage()"
        />
        <CheckboxButton
          v-model="enableGradient"
          :icon="MdiGradientVertical"
          label="Gradient"
          @update:model-value="() => saveToLocalStorage()"
        />
        <CheckboxButton
          v-model="enableCA"
          :icon="MdiLens"
          label="Chromatic Aberration"
          @update:model-value="() => saveToLocalStorage()"
        />
        <CheckboxButton
          v-model="enableBackground"
          :icon="MdiImageOutline"
          label="Background"
          @update:model-value="() => saveToLocalStorage()"
        />
      </div>
      <label for="abberationIntensity" id="abberationIntensityLabel">
        <span>Chromatic Aberration Intensity</span>
        <input
          id="abberationIntensity"
          v-model="abberationIntensity"
          type="range"
          min="1"
          max="3"
          step="0.1"
          @update:model-value="() => saveToLocalStorage()"
        />
      </label>

      <hr />
      <h2>Resolution</h2>

      <div class="input-row">
        <label for="gradientType">
          <span>Width</span>
          <input
            id="gradientWidth"
            v-model="width"
            type="number"
            @update:model-value="() => saveToLocalStorage()"
          />
        </label>
        <label for="gradientType">
          <span>Height</span>
          <input
            id="gradientHeight"
            v-model="height"
            type="number"
            @update:model-value="() => saveToLocalStorage()"
          />
        </label>
      </div>

      <hr />

      <div class="button-grid">
        <Button
          id="generateButton"
          :icon="MdiDownload"
          label="Generate SVG"
          @click="generateSVG"
        />
        <Button
          id="downloadJSONButton"
          :icon="MdiDownload"
          label="Download JSON"
          @click="downloadJSON"
        />
        <Button
          id="importJSONButton"
          :icon="MdiUpload"
          label="Import JSON"
          @click="importJSON"
        />
        <Button
          id="resetButton"
          danger
          :icon="MdiDelete"
          label="Reset"
          @click="resetPaintSurfac"
        />
      </div>

      <footer>
        <span>Coded with ❤️ by avocadoom - </span>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://thilo-billerbeck.com/impressum/"
          >Imprint</a
        >
        <span> - </span>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/thilobillerbeck/gpn23-svg-generator"
          >Source Code</a
        >
      </footer>
    </div>
  </div>
</template>

<style>
.container {
  position: absolute;
  display: block;
  width: max-content;
  height: max-content;
  border: 2px solid #999;
  margin: auto;
}
.toolbar {
  display: flex;
  flex-direction: column;
  background-color: #111;
  border-radius: 5px;
  border-left: 1px solid #fff;
  justify-content: start;
  color: #fff;
  gap: 1rem;
  padding: 1rem;
  flex: 0;
  width: min-content;
  height: 100%;
  resize: both;
}
.grid {
  display: flex;
  height: 100vh;
}
.paint-surface {
  overflow: auto;
  flex: 3;
}
.triangle-overlay {
  cursor: pointer;
}
.triangle-overlay:hover {
  fill: #ddd;
}
.triangle-overlay-light:hover {
  fill: #222;
}
.input-row {
  display: flex;
  gap: 1rem;
}
.button-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(150px, 1fr));
  gap: 0.5rem;
}
footer {
  text-align: center;
  font-size: 0.8rem;
  color: #aaa;
}
#abberationIntensityLabel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
#abberationIntensity {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 1rem;
  background: #444;
  outline: none;
}
</style>
