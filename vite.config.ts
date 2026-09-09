import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleCopilotRequest } from './server/geminiProxy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function geminiCopilotPlugin(): Plugin {
  return {
    name: 'gemini-copilot-plugin',
    configureServer(server) {
      server.middlewares.use('/api/copilot', (req, res) => {
        handleCopilotRequest(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/copilot', (req, res) => {
        handleCopilotRequest(req, res);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), geminiCopilotPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
  build: {
    sourcemap: true,
    target: 'es2022',
  },
});
