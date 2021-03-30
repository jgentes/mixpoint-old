module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        },
        corejs: '3',
        useBuiltIns: 'entry'
      }
    ],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
}
