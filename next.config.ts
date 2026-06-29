import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        pathname: "/photo/**",
      },
      {
        protocol: "https",
        hostname: "st3.depositphotos.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
