
const path = require('path');

const px2rem = require('postcss-px2rem');
const autoprefixer = require('autoprefixer');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const constConfig = require("./const.config");
// case 1:
// return '//assets.daily.geilicdn.com/' + staticUrl;
// case 2:
// return '//assets.pre.geilicdn.com/' + staticUrl;
// default:
// return '//assets.geilicdn.com/' + staticUrl;
const webPackConfig = {
  entry: './src/entry.js',
  output: {
    path: path.join(__dirname, '..', 'build', 'static'),
    publicPath: '//assets.daily.geilicdn.com/m/marketing-activity-a/',
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
        }
      },
      {
        test: /\.html$/,
        use: {
          loader: "html-loader",
          options: {
            minimize: true
          }
        }
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
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
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
  plugins: [

    new webpack.DefinePlugin(constConfig),

    new webpack.NoEmitOnErrorsPlugin(),

    new UglifyJsPlugin(),

    new ExtractTextPlugin("styles.css"),

    new HtmlWebpackPlugin({
      filename: '../pages/index.html',
      template: './src/index.html',
      inject: true
    })

  ]
};




module.exports = webPackConfig;