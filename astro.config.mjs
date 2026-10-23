import { defineConfig } from 'astro/config';
import { deploymentConfig } from './scripts/deployment-config.mjs';

export default defineConfig({
  output: 'static',
  ...deploymentConfig(),
  trailingSlash: 'always',
});
