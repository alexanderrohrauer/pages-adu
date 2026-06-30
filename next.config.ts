import type { NextConfig } from "next";

function minioRemotePattern(): {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
} {
  try {
    const u = new URL(process.env.MINIO_PUBLIC_URL ?? "http://localhost:9000");
    return {
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
    };
  } catch {
    return { hostname: "localhost", port: "9000" };
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
  output: "standalone",
  cacheComponents: true,
  devIndicators: false,
  poweredByHeader: false,
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: false,
    },
    incomingRequests: false,
  },
  images: {
    // TODO fix some day
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      minioRemotePattern(),
    ],
  },
  experimental: {
    prefetchInlining: true,
    cachedNavigations: true,
    appNewScrollHandler: true,
    inlineCss: true,
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
