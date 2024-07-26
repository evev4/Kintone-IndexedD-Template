const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: { index: "./src/js/main.js" },
  resolve: {
    alias: {
      modules: __dirname + "/node_modules",
      common: __dirname + "/common"
    }
  },
  optimization: {
    minimizer: [
      // https://webpack.js.org/plugins/terser-webpack-plugin/#preserve-comments
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /@license/i
          }
        }
      })
    ]
  }
};
