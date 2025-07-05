import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iiuouihdvvppiddwrfwr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'abc.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
