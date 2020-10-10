module.exports = {
  entry: { main: './src/main/index.ts' },
  target: 'electron-main',
  resolve: { alias: { '@': process.cwd() } },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader'
    }, {
      test: /\.txt$/,
      use: 'raw-loader'
    }]
  }
}