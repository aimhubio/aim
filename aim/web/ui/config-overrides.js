const webpack = require('webpack');
const WebpackDynamicPublicPathPlugin = require('webpack-dynamic-public-path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  webpack: function (config, webpackEnv) {
    const isEnvProduction = webpackEnv === 'production';

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Optimization Overrides
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
      },
    };
    config.optimization.runtimeChunk = true;

    // Output Overrides.
    if (isEnvProduction) {
      // JS static filenames overrides.
      config.output.filename = 'static/js/[name].js?version=[contenthash]';
      config.output.chunkFilename = 'static/js/[name].js?version=[contenthash]';
    }

    // Plugins Overrides.
    if (isEnvProduction) {
      // CSS static filenames overrides.
      config.plugins.forEach((plugin, index) => {
        if (plugin instanceof MiniCssExtractPlugin) {
          // remove the existing MiniCssExtractPlugin and add new one
          config.plugins.splice(
            index,
            1,
            new MiniCssExtractPlugin({
              filename: 'static/css/[name].css?version=[contenthash]',
              chunkFilename: 'static/css/[name].css?version=[contenthash]',
            }),
          );
        }
      });
    }

    // Add external variable for base path support.
    config.plugins.push(
      new WebpackDynamicPublicPathPlugin({
        externalPublicPath: 'window.externalPublicPath',
      }),
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: !isEnvProduction,
      }),
    );
    return config;
  },
};
