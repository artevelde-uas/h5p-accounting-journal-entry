const { EnvironmentPlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'h5p-accounting-journal-entry': './src/entries/h5p-accounting-journal-entry.js'
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
      exclude: /node_modules/,
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
          localIdentName: 'h5p-accounting-journal-entry-[local]',
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
