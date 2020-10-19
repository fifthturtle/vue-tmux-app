const path = require('path');
 
function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
    publicPath: './',
    devServer: {
      host: "0.0.0.0",
      public: "0.0.0.0:8080",
      disableHostCheck: true,
      proxy: {
        "/app": {
          target: "http://dev3.boolean.tv/tmux_monitor/",
          changeOrigin: true,
          ws: true
          }
        }
      },
    lintOnSave: true,
    chainWebpack: (config) => {
      config.resolve.alias.set('vue$', 'vue/dist/vue.esm.js')
    }
}