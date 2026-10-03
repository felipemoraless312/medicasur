/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite probar desde el celular en la red local aunque cambie la IP de la PC (solo afecta a `next dev`).
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.*.*'],
}

export default nextConfig
