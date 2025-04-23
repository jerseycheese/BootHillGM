#!/bin/bash

# Fix unused variables
echo "Fixing unused variables..."

# First try automatic fix with ESLint
npx eslint --fix "./app/**/*.{ts,tsx}" --rule "@typescript-eslint/no-unused-vars: warn"

# Generate list of remaining unused variables
UNUSED_VARS_FILES=$(grep -l "is defined but never used" <(npx eslint "./app/**/*.{ts,tsx}" --rule "@typescript-eslint/no-unused-vars: warn"))

if [ -n "$UNUSED_VARS_FILES" ]; then
  echo "The following files have unused variables that need prefixing with underscore:"
  echo "$UNUSED_VARS_FILES" | tr ' ' '\n'
  
  # Generate a detailed report
  echo "\nUnused variables details:" > unused_vars_report.txt
  for file in $UNUSED_VARS_FILES; do
    echo "\n$file:" >> unused_vars_report.txt
    grep "is defined but never used" <(npx eslint "$file" --rule "@typescript-eslint/no-unused-vars: warn") >> unused_vars_report.txt
  done
  
  echo "Detailed report saved to unused_vars_report.txt"
fi
