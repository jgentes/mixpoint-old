module.exports = function (wallaby) {
  return {
    files: [{ pattern: 'src/**/*.js', load: false }],

    tests: [{ pattern: 'test/**/*Spec.js', load: false }],

    postprocessor: wallaby.postprocessors.webpack({
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true
              }
            }
          }
        ]
      }
    }),

    env: {
      kind: 'chrome'
    },

    setup: function () {
      window.__moduleBundler.loadTests()
    }
  }
}
