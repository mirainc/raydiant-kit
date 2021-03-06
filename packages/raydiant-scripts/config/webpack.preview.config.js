const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const webpack = require('webpack');
const paths = require('./paths');
const common = require('./webpack.common');
const getClientEnvironment = require('./env');

module.exports = (relConfigPath = 'raydiant.config.js') => {
  const configPath = paths.resolveApp(relConfigPath);
  const env = getClientEnvironment({
    RAYDIANT_SIMULATOR_APP_INDEX_PATH: paths.appIndexJs,
    RAYDIANT_SIMULATOR_APP_CONFIG_PATH: configPath,
    RAYDIANT_SIMULATOR_APP_ICON_PATH: fs.existsSync(paths.appIcon)
      ? paths.appIcon
      : '',
  });

  return {
    devtool: 'cheap-module-source-map',
    entry: [
      // Development polyfills (mainly for promise rejection tracking).
      require.resolve('./polyfills'),
      // Enables auto reload.
      require.resolve('react-dev-utils/webpackHotDevClient'),
      // The simulator entry, the app path to load is set with
      // the RAYDIANT_SIMULATOR_APP_PATH environment variable.
      require.resolve('raydiant-simulator/preview'),
    ],
    output: {
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: true,
      filename: 'bundle.js',
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: info =>
        path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    resolve: {
      ...common.resolve,
    },
    module: {
      ...common.module,
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: require.resolve('raydiant-simulator/preview.html'),
      }),
      // Add module names to factory functions so they appear in browser profiler.
      new webpack.NamedModulesPlugin(),
      // Makes some environment variables available to the JS code.
      new webpack.DefinePlugin(env.stringified),
      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      ...common.plugins,
    ],
    node: {
      ...common.node,
    },
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
      hints: false,
    },
  };
};
