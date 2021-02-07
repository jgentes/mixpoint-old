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
    siteTitle: 'DJ Set Mixer',
    siteDescription: 'Default Dashboard ready for Development',
    siteCannonicalUrl: 'http://localhost:4100',
    siteKeywords: 'react dashboard seed bootstrap',
    scssIncludes: []
}

module.exports = config;