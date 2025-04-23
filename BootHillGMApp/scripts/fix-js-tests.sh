#!/bin/bash

# Fix JavaScript test files with Jest globals
echo "Fixing JavaScript test files..."

# Find JavaScript test files with global reference issues
JS_TEST_FILES=$(grep -l "is not defined" <(npx eslint "./app/**/*.test.js" --rule "no-undef: error"))

if [ -n "$JS_TEST_FILES" ]; then
  echo "Fixing the following JavaScript test files:"
  echo "$JS_TEST_FILES" | tr ' ' '\n'
  
  # Add Jest globals to the top of each file
  for file in $JS_TEST_FILES; do
    # Check if the file already has Jest globals
    if ! grep -q "global describe, test, expect" "$file"; then
      # Add Jest globals to the top of the file
      sed -i '' '1s/^/\/* global describe, test, expect *\/\n\n/' "$file"
      echo "Added Jest globals to $file"
    fi
  done
fi
