export default {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'pharm',
      buildPath: 'src/css/',
      files: [
        {
          destination: 'index.css',
          format: 'css/variables',
          options: {
            selector: ':root',
          },
        },
      ],
    },
    scss: {
      transformGroup: 'scss',
      prefix: 'pharm',
      buildPath: 'src/scss/',
      files: [
        {
          destination: '_variables.scss',
          format: 'scss/map-deep',
          options: {
            mapName: 'pharm-tokens',
          },
        },
      ],
    },
  },
}
