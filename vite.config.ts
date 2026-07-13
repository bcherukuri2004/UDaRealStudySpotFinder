import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars (including non-VITE_ ones) so the key stays server-side only
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 3000,
      proxy: {
        // Browser calls /fsq/... -> Vite forwards to Foursquare with the secret key attached
        "/fsq": {
          target: "https://places-api.foursquare.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/fsq/, ""),
          headers: {
            Authorization: `Bearer ${env.FOURSQUARE_API_KEY}`,
            "X-Places-Api-Version": "2025-06-17",
          },
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
