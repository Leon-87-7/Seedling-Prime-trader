import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Helpful defaults
  reactStrictMode: true,

  // Explicitly set the Turbopack root to this project directory so Next
  // doesn't infer a different workspace root when multiple lockfiles exist.
  // This silences the warning shown when running `next dev --turbopack`.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
