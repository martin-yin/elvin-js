module.exports = {
  verbose: true,
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testPathIgnorePatterns: ['/dist/'],
  transform: {
    '^.+\\.[t|j]s?$': 'esbuild-jest'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testRegex: '.*\\.test\\.ts?$',
  moduleNameMapper: {
    '^configs/(.*)$': '<rootDir>/configs/$1',
    '^app/(.*)$': '<rootDir>/app/$1'
  }
}
