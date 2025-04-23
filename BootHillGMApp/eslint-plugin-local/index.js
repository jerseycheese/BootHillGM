/**
 * ESLint plugin index file for local rules.
 */

module.exports = {
  rules: {
    'no-action-literals': require('./rules/no-action-literals')
  }
};