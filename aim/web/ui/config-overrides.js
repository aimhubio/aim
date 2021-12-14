const WebpackDynamicPublicPathPlugin = require("webpack-dynamic-public-path");

module.exports = {
  webpack: function(config, env) {
    config.output.publicPath = '/static-files';
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
      },
    };
    config.optimization.runtimeChunk = false;
    config.plugins.push(new WebpackDynamicPublicPathPlugin({
      externalPublicPath: 'window.externalPublicPath',
    }));
    return config;
  },
};