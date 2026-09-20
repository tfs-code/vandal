import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
        plugins: [react()],
        server: {
            proxy: {
                "/api/henrik": {
                    target: "https://api.henrikdev.xyz",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/henrik/, ""),
                    headers: { Authorization: env.HENRIK_API_KEY },
                },
            },
        },
    };
});
