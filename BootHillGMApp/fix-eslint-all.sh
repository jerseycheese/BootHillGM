#!/bin/bash

echo "Starting ESLint fixes..."

# 1. Fix duplicate imports
echo "=== Fixing Duplicate Imports ==="
npx eslint --fix "./app/**/*.{ts,tsx}" --rule "no-duplicate-imports: error"

# 2. Fix JavaScript test files with Jest globals
echo "=== Fixing JavaScript Test Files ==="
for file in $(find ./app -name "*.test.js"); do
  # Check if the file already has Jest globals
  if ! grep -q "global describe, test, expect" "$file"; then
    # Add Jest globals to the top of the file
    sed -i '' '1s/^/\/* global describe, test, expect *\/\n\n/' "$file"
    echo "Added Jest globals to $file"
  fi
done

# 3. Fix empty block statements with comments
echo "=== Fixing Empty Blocks ==="
FILES_WITH_EMPTY_BLOCKS=$(npx eslint --format json "./app/**/*.{ts,tsx}" --rule "no-empty: error" | grep -oE '\"filePath\":\"[^\"]+\".+?\"errorCount\":[^0]' | grep -oE '\"filePath\":\"[^\"]+\"' | grep -oE '[^\"]+\/[^\"]+')

for file in $FILES_WITH_EMPTY_BLOCKS; do
  echo "Adding comments to empty blocks in $file"
  # This is a simple placeholder - manual review will still be needed
  sed -i '' 's/{\s*}/{ \/* Intentionally empty *\/ }/g' "$file"
done

# 4. Fix unused variables by prefixing with underscore
echo "=== Fixing Unused Variables ==="
npx eslint --fix "./app/**/*.{ts,tsx}" --rule "@typescript-eslint/no-unused-vars: warn"

# 5. Fix unnecessary escape characters
echo "=== Fixing Escape Characters ==="
FILES_WITH_ESCAPE_CHARS=$(npx eslint --format json "./app/**/*.{ts,tsx}" --rule "no-useless-escape: error" | grep -oE '\"filePath\":\"[^\"]+\".+?\"errorCount\":[^0]' | grep -oE '\"filePath\":\"[^\"]+\"' | grep -oE '[^\"]+\/[^\"]+')

if [ -n "$FILES_WITH_ESCAPE_CHARS" ]; then
  echo "Files with unnecessary escape characters - manual fix needed:"
  echo "$FILES_WITH_ESCAPE_CHARS"
fi

# 6. Apply ActionTypes rule to find string literals
echo "=== Finding Action Type String Literals ==="
npx eslint "./app/**/*.{ts,tsx}" --rule "local/no-action-literals: warn"

echo "=== All automated fixes complete ==="
echo "Some issues require manual intervention. Please review the logs above."
