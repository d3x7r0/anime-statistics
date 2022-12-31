module.exports = {
  'presets': [
    '@babel/preset-env',
    'babel-preset-vite'
  ],
  'plugins': [
    ['@babel/plugin-transform-react-jsx', { 'runtime': 'automatic' }],
  ],
}
