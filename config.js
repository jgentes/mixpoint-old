const path = require('path')

const root = path.join(__dirname)

const config = {
  rootDir: root,
  // Targets ========================================================
  serveDir: path.join(root, '.serve'),
  distDir: path.join(root, 'dist'),

  // Source Directory ===============================================
  srcDir: path.join(root, 'src'),
  srcServerDir: path.join(root, 'server'),

  // HTML Layout ====================================================
  srcHtmlLayout: path.join(root, 'src', 'index.html'),

  // Site Config ====================================================
  siteTitle: 'DJ Set Editor',
  siteDescription: 'Multi-track audio editor designed for mixing dj sets',
  siteCannonicalUrl: 'http://localhost:1234',
  scssIncludes: []
}

module.exports = config
