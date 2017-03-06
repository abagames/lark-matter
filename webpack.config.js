module.exports = {
  entry: {
    'lark-matter': ['./src/lark-matter/index.ts'],
    wrecking: ['./src/wrecking/index.ts', './src/lark-matter/index.ts'],
    newton: ['./src/newton/index.ts', './src/lark-matter/index.ts']
  },
  output: {
    path: __dirname + '/docs',
    filename: '[name]/index.js',
    library: ['[name]'],
    libraryTarget: 'umd'
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
  },
  externals: {
    "matter-js": "Matter"
  }
};