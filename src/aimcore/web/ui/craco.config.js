const webpack = require('webpack');
const WebpackDynamicPublicPathPlugin = require('webpack-dynamic-public-path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const isEnvProduction = env === 'production';

      // Optimization Overrides
      webpackConfig.optimization.splitChunks = {
        cacheGroups: {
          default: false,
        },
      };
      webpackConfig.optimization.runtimeChunk = true;
      webpackConfig.output.filename = '[name].js';
      webpackConfig.output.chunkFilename = '[name].js';
      // Output Overrides.
      if (isEnvProduction) {
        // JS static filenames overrides.
        webpackConfig.configure((config) => {
          config.output.filename = 'static/js/[name].js?version=[contenthash]';
          config.output.chunkFilename =
            'static/js/[name].js?version=[contenthash]';
        });
      }

      // Plugins Overrides.
      if (isEnvProduction) {
        // CSS static filenames overrides.
        webpackConfig.plugins.forEach((plugin, index) => {
          if (plugin instanceof MiniCssExtractPlugin) {
            // remove the existing MiniCssExtractPlugin and add new one
            webpackConfig.plugins.splice(
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
      webpackConfig.plugins.push(
        new WebpackDynamicPublicPathPlugin({
          externalPublicPath: 'window.externalPublicPath',
        }),
      );

      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: !isEnvProduction,
        }),
      );

      return webpackConfig;
    },
  },
};
