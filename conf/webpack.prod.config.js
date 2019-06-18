const { EnvironmentPlugin } = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const postcssClean = require('postcss-clean');

module.exports = {
  mode: 'production',
  entry: {
    'h5p-accounting-journal-entry': [
      '@babel/polyfill',
      'array-flat-polyfill',
      'nodelist-foreach-polyfill',
      'whatwg-fetch',
      './src/scripts/polyfills.js',
      './src/entries/h5p-accounting-journal-entry.js'
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin()
    ]
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'production'
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
          camelCase: 'only'
        }
      }, {
        loader: 'postcss-loader',
        options: {
          plugins: [
            postcssImport(),
            postcssPresetEnv(),
            postcssClean({
              level: {
                1: {
                  removeEmpty: false
                },
                2: {
                  removeEmpty: false
                }
              }
            })
          ]
        }
      }]
    }]
  }
};
