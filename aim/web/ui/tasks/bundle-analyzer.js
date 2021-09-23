// set env mode to production
// to check sizes for production chunked bundles
process.env.NODE_ENV = 'production';

// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const webpackConfig = require('react-scripts/config/webpack.config')(
  'production',
);

//  optional plugins
webpackConfig.plugins.push(new BundleAnalyzerPlugin());
webpackConfig.plugins.push(
  new ProgressBarPlugin({
    format: `${'analyzing...'} ${'[:bar]'}${'[:percent]'}${'[:elapsed seconds]'} - :msg`,
  }),
);

// run webpack
webpack(webpackConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err);
  }
});
