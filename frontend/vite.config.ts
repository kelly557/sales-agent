import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createQwenChatProxy } from "./vite-server-plugins/qwenChatProxy";
import { createPptGenerationProxy } from "./vite-server-plugins/pptGenerationProxy";
import { createSkillsProxy } from "./vite-server-plugins/skillsProxy";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      createQwenChatProxy({ qwenApiKey: env.QWEN_API_KEY }),
      createPptGenerationProxy({ qwenApiKey: env.QWEN_API_KEY }),
      createSkillsProxy(),
      cloudflare()
    ],
    server: {
      port: 2288,
      strictPort: true,
    },
    preview: {
      port: 2288,
      strictPort: true,
    },
  };
});