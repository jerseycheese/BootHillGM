/**
 * ESLint rule to enforce usage of ActionTypes constants instead of string literals
 * 
 * This rule detects action type string literals that use a domain/ACTION_NAME pattern
 * and suggests using the corresponding ActionTypes constant instead.
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce usage of ActionTypes constants instead of string literals",
      category: "Best Practices",
      recommended: true
    },
    fixable: "code",
    schema: []
  },
  create: function(context) {
    return {
      Property(node) {
        // Check if property name is 'type'
        if (node.key && 
            ((node.key.type === "Identifier" && node.key.name === "type") || 
             (node.key.type === "Literal" && node.key.value === "type")) && 
            node.value.type === "Literal") {
          // Check if action type is a string literal with domain/ACTION_NAME pattern
          if (typeof node.value.value === "string" && node.value.value.includes('/')) {
            const actionType = node.value.value;
            
            // Skip if already using ActionTypes
            if (node.value.raw && node.value.raw.includes('ActionTypes.')) {
              return;
            }

            context.report({
              node,
              message: `Use ActionTypes constant for action type '${actionType}'. Import from '../types/actionTypes'.`,
              fix: function(fixer) {
                // For the fix, we use the whole constant name
                // We don't try to convert domain/ACTION_NAME to ActionTypes.domain.ACTION_NAME
                // because our ActionTypes object is flat
                const actionName = actionType.split('/')[1];
                const suggestedFix = `ActionTypes.${actionName}`;
                return fixer.replaceText(node.value, suggestedFix);
              }
            });
          }
        }
      }
    };
  }
};