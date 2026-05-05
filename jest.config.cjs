module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/spec/javascript'],
  testMatch: ['**/__tests__/**/?(*.)+(js|jsx)', '**/?(*.)+(spec|test).(js|jsx)'],
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
