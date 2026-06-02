import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "offline.html",
        "icons/favicon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/maskable-icon-512.png",
      ],

      manifest: {
        name: "Fitness Buddy Pro",
        short_name: "FitnessBuddy",
        description:
          "A modern fitness, workout, diet, habit, meal, reminder, and body transformation tracking app.",

        theme_color: "#009587",
        background_color: "#031113",

        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],

        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "http://localhost:5000" ||
              url.origin.includes("render.com"),
            handler: "NetworkFirst",
            options: {
              cacheName: "FitnessBuddyPro-api-cache",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "FitnessBuddyPro-image-cache",
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
});