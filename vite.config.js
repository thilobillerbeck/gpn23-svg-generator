import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";
import favicons from "@peterek/vite-plugin-favicons";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), Icons(), favicons("./public/favicon.svg")],
});
