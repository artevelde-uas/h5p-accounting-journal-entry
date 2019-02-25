const { EnvironmentPlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'h5p-accounting-journal-entry': './src/index.js'
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'development'
    }),
    new MiniCssExtractPlugin()
  ],
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              useBuiltIns: 'entry',
              loose: true
            }]
          ]
        }
      }]
    }, {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader
      }, {
        loader: 'css-loader',
        options: {
          modules: true,
          localIdentName: 'h5p-accounting-journal-entry__[local]',
          camelCase: true
        }
      }, {
        loader: 'postcss-loader',
        options: {
          plugins: [
            postcssImport(),
            postcssPresetEnv()
          ]
        }
      }]
    }]
  }
};
