import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
  ],
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'production' }),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'AIQLPlayground',
      fileName: (format) => `aiql-playground.${format === 'es' ? 'js' : 'umd.js'}`,
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime',
        'prism-react-renderer',
        'framer-motion',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        '@aiql-org/core',
        '@aiql-org/examples'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'prism-react-renderer': 'PrismReactRenderer',
          'framer-motion': 'FramerMotion',
          'lucide-react': 'LucideReact',
          'clsx': 'clsx',
          'tailwind-merge': 'tailwindMerge',
          '@aiql-org/core': 'AIQLCore',
          '@aiql-org/examples': 'AIQLExamples',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
