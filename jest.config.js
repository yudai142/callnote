export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/spec/javascript'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'app/javascript/**/*.jsx',
    '!app/javascript/**/*.test.jsx',
  ],
  setupFilesAfterEnv: ['<rootDir>/spec/javascript/setup.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};
