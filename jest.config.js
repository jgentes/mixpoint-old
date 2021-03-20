// from https://testing-library.com/docs/react-testing-library/setup
module.exports = {
  setupFilesAfterEnv: ['./test-setup.js'],
  moduleDirectories: [
    'node_modules',
    // add the directory with the test-utils.js file:
    __dirname // root
  ]
}
