const { mkdir, writeFile } = require('fs').promises

const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const StyleExtHtmlPlugin = require('style-ext-html-webpack-plugin')
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin')
const CspHtmlPlugin = require('csp-html-webpack-plugin')

// HACK: Wrapper to allow StyleExtHtmlPlugin to work with Webpack 5
// TODO: Reported in the following issue, will need to keep an eye on this:
//   https://github.com/numical/style-ext-html-webpack-plugin/issues/54
class StyleExtHtmlWebpack5Plugin extends StyleExtHtmlPlugin {
  deleteFileFromCompilation(compilation, filename) {
    delete compilation.assets[filename]
    compilation.chunks.forEach(chunk => {
      chunk.files.delete(filename)
    })
  }

  emitCallback(compilation, callback) {
    if (this.filesToDelete.size > 0) {
      const deleteFile = this.deleteFileFromCompilation.bind(null, compilation)
      this.filesToDelete.forEach(deleteFile)
      this.filesToDelete.clear()
    }
        
    if (callback) {
      callback()
    }
  }
}

// HACK: CspHtmlWebpack will overwrite its `defaultProcessFn`
//       with no access to it from the given `processFn` option
//       so allow it to be chained to `defaultProcessFn`
class ChainedCspHtmlPlugin extends CspHtmlPlugin {
  constructor(policy = {}, additionalOpts = {}) {
    const chainedProcessFn = additionalOpts.processFn
    delete additionalOpts.processFn

    super(policy, additionalOpts)

    this.opts = { ... this.opts } // unfreeze options
    
    const defaultProcessFn = this.opts.processFn
    this.opts.processFn = (builtPolicy, htmlPluginData, $) => {
      defaultProcessFn(builtPolicy, htmlPluginData, $)
      chainedProcessFn(builtPolicy, htmlPluginData, $)
    }
  }
}

module.exports = {
  entry: { renderer: './src/renderer/index.ts' },
  target: 'electron-renderer',
  resolve: { alias: { '@': process.cwd() } },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader'
    }, {
      test: /\.css$/,
      use: [ MiniCssExtractPlugin.loader, 'css-loader' ]
    }]
  },
  plugins: [
    new HtmlPlugin({
      title: 'Trilogy',
      filename: 'renderer.html'
    }),
    new MiniCssExtractPlugin(),
    new StyleExtHtmlWebpack5Plugin({
      minify: { level: { 1: { specialComments: false } } }
    }),
    new ScriptExtHtmlPlugin({ inline: /\.js$/ }),
    new ChainedCspHtmlPlugin({
      'base-uri': "'none'",
      'object-src': "'none'",
      'script-src': '',
      'style-src': ''
    }, {
      hashingMethod: 'sha512',
      async processFn(policy) {
        try {
          await mkdir('dist')
        } catch (error) {
          if (error.code !== 'EEXIST') {
            throw error
          }
        }
        writeFile('dist/csp.txt', policy)
      }
    })
  ]
}