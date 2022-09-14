/** @type {import('jest').Config} */
module.exports = {
  coverageReporters: ["json-summary"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
