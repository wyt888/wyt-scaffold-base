
const path = require('path');

const px2rem = require('postcss-px2rem');
const autoprefixer = require('autoprefixer');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const constConfig = require("./const.config");

console.log(path.join(__dirname, '..', "src/css/page.screenshot.less"));


const webPackConfig = {
  entry: './src/entry.js',
  output: {
    path: path.join(__dirname, '..', 'build'),
    publicPath: '/',
    filename: '[name].js',
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '..', 'src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // options: {
          //   presets: ['@babel/preset-env']
          // }
        }
      },
      {
        test: /\.html$/,
        use: "html-loader"
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        exclude: [
          path.join(__dirname, '..', "src/assets/s-q.png")
        ],
        loader: 'url-loader',
        options: {
          limit: 10000,
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        include: [
          path.join(__dirname, '..', "src/assets/s-q.png")
        ],
        loader: 'url-loader',
        options: {
          limit: 10,
        }
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                // config: {
                //   path: './config/postcss.config.js'
                // },
                plugins: () => [
                  px2rem({
                    rempUnit: 75,
                    remPrecision: 4
                  }),
                  autoprefixer(),
                ]
              }
            },
            {
              loader: 'less-loader',
            }
          ]
        })
      }
    ]
  },
  devtool: '#cheap-module-eval-source-map',
  plugins: [

    new webpack.DefinePlugin(constConfig),

    new webpack.HotModuleReplacementPlugin(),

    new webpack.NoEmitOnErrorsPlugin(),

    new ExtractTextPlugin("styles.css"),
    // new ExtractTextPlugin({
    //   filename: '[name].css'
    // }),

    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './src/index.html',
      inject: true
    }),

    new FriendlyErrorsPlugin()

  ]
};




module.exports = webPackConfig;