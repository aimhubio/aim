const WebpackDynamicPublicPathPlugin = require('webpack-dynamic-public-path');

module.exports = {
  webpack: function (config, env) {
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
      },
    };
    config.optimization.runtimeChunk = true;
    config.plugins.push(
      new WebpackDynamicPublicPathPlugin({
        externalPublicPath: 'window.externalPublicPath',
      }),
    );

    return config;
  },
};
