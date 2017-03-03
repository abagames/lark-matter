module.exports = {
  entry: require('glob').sync('./src/**/*.ts'),
  output: {
    path: __dirname + '/docs',
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules', 'web_modules']
  },
  devtool: 'source-map',
  devServer: {
    contentBase: 'docs'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|web_modules)/,
        loader: 'awesome-typescript-loader'
      }
    ]
  }
};