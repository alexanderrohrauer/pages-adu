import path from "node:path";

// config/config.js is provided at container runtime via a bind mount (see
// docker-compose.yml) so it can be swapped without rebuilding the image.
// The ignore comments stop the bundler from inlining its contents at build
// time, which would otherwise freeze whatever was on disk during `next build`.
export async function loadConfig() {
  const configPath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "config/config.js"
  );
  return (await import(/* webpackIgnore: true */ configPath)).default;
}
