/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      '222.252.23.248',  // Synology NAS
      'incanto.myds.me',  // Synology DDNS (if used)
      'localhost'  // For image proxy API
    ],
    formats: ['image/webp', 'image/avif'],
  },
  output: 'standalone',
}

module.exports = nextConfig
