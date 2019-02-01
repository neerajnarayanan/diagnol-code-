var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

var isDevelopment = process.env.NODE_ENV !== 'production';
var BUILD_PATH = path.resolve(__dirname, 'lib');

var common = {
  entry: {},
  output: {},
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.css$/, exclude: /node_modules/, loader: 'style!css' }
    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
};

var finalConf;
if (isDevelopment) {
  finalConf = Object.assign({}, common);
  finalConf.entry.app = ['webpack-hot-middleware/client', './demos/index.js']; // HMR
  finalConf.output = {
    path: BUILD_PATH,
    filename: 'demo.js'
  };
  finalConf.devtool = 'source-map';
  finalConf.plugins = [...finalConf.plugins,
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()];
} else {
  // production config
  finalConf = Object.assign({}, common);
  finalConf.entry.app = './app/index.js';
  finalConf.output = {
    path: BUILD_PATH,
    filename: 'index.js',
    sourceMapFilename: 'index.map',
    library: 'InfiniteScroll',
    libraryTarget: 'umd'
  };
  finalConf.externals = {
    'react': {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  };
  finalConf.plugins = [...finalConf.plugins,
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  ];
}

module.exports = finalConf;
