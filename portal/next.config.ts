import type { NextConfig } from 'next';
const config: NextConfig = {
 output: 'export', trailingSlash: true, assetPrefix: '/portal-assets',
 poweredByHeader: false, images: { unoptimized: true },
};
export default config;
