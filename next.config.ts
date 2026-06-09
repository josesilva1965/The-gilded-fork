import type { NextConfig } from "next";
import os from "os";

const devOrigins = ["localhost", "127.0.0.1"];
try {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    const iface = interfaces[name];
    if (iface) {
      for (const net of iface) {
        if (net.family === "IPv4") {
          devOrigins.push(net.address);
          devOrigins.push(`${net.address}:3000`);
        }
      }
    }
  }
} catch (e) {
  console.error("Failed to resolve local IPs for allowedDevOrigins", e);
}

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: devOrigins,
};

export default nextConfig;
