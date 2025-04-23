#!/bin/bash

# Fix duplicate imports
echo "Fixing duplicate imports..."

# First try automatic fix with ESLint
npx eslint --fix "./app/**/*.{ts,tsx}" --rule "no-duplicate-imports: error"

# Find files with remaining duplicate import issues
DUPLICATE_IMPORT_FILES=$(grep -l "import is duplicated" <(npx eslint "./app/**/*.{ts,tsx}" --rule "no-duplicate-imports: error"))

if [ -n "$DUPLICATE_IMPORT_FILES" ]; then
  echo "The following files need manual fixes for duplicate imports:"
  echo "$DUPLICATE_IMPORT_FILES" | tr ' ' '\n'
fi
