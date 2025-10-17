/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
  },
  // For App Router, body size limits are handled differently
  // The middleware and route handlers manage file size limits
}

module.exports = nextConfig