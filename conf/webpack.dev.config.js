const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const postcssClean = require('postcss-clean');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'h5p-accounting-journal-entry': './src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env', {
                    useBuiltIns: 'entry',
                    loose: true
                  }
                ]
              ]
            }
          }
        ]
      }, {
        test: /\.css$/,
        use: [
          {
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
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new MiniCssExtractPlugin()
  ]
};
