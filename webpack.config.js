var path = require('path')

var config = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    './src/index'
  ],
  resolve: {
    modules: ['node_modules']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'FirebaseSubscriber',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  },
  devServer: {
    contentBase: './example',
    hot: true
  }
}

module.exports = config
