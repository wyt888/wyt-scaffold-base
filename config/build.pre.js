
var path = require('path')
var chalk = require('chalk')

var webpack = require('webpack')
var webpackConfig = require('./webpack.pre.config')

console.log(chalk.cyan(`building for ${process.env.ENV}...`))

webpack(webpackConfig, function (err, stats) {
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')

  console.log(chalk.cyan('  Build complete.\n'))
})
