export default {
    server: {
      proxy: {
        '/messages': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }