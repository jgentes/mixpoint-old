var path = require('path');

var root = path.join(__dirname);

var config = {
    rootDir: root,
    // Targets ========================================================
    serveDir: path.join(root, '.serve'),
    distDir: path.join(root, 'dist'),
    clientManifestFile: 'manifest.webpack.json',
    clientStatsFile: 'stats.webpack.json',

    // Source Directory ===============================================
    srcDir: path.join(root, 'airframe'),
    editorDir: path.join(root, 'djseteditor'),
    srcServerDir: path.join(root, 'server'),

    // HTML Layout ====================================================
    srcHtmlLayout: path.join(root, 'djseteditor', 'index.html'),

    // Site Config ====================================================
    siteTitle: 'DJ Set Editor',
    siteDescription: 'Multi-track audio editor designed for mixing dj sets',
    siteCannonicalUrl: 'http://localhost:4100',
    scssIncludes: []
}

module.exports = config;