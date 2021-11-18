const SentryCliPlugin = require('@sentry/webpack-plugin');

const { version } = require('./package.json');

module.exports = function override(config, env) {
  config.plugins.push(
    new SentryCliPlugin({
      include: '.',
      ignore: ['node_modules', 'config-override.js', 'tasks'],
      dryRun: process.env.NODE_ENV !== 'production',
      project: 'test-vn0',
      org: 'test-vn0',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: version,
      validate: true,
    }),
  );
  return config;
};
