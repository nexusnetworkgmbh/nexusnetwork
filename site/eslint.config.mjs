import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Full-document links are intentional for this statically exported website.
  // They also load the destination document's own CSP hashes.
  { rules: { '@next/next/no-html-link-for-pages': 'off' } },
  globalIgnores(['.next/**', 'out/**', 'build/**', '.wrangler/**', 'next-env.d.ts']),
]);

export default eslintConfig;
