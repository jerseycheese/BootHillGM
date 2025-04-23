#!/bin/bash

# Master script to run all ESLint fixes
echo "Starting ESLint fixes..."

# Make all scripts executable
chmod +x ./scripts/*.sh

# Run each fix script
echo "=== Fixing Duplicate Imports ==="
./scripts/fix-duplicate-imports.sh

echo "=== Identifying Function Order Issues ==="
./scripts/fix-function-order.sh

echo "=== Fixing Unused Variables ==="
./scripts/fix-unused-vars.sh

echo "=== Identifying Empty Block Statements ==="
./scripts/fix-empty-blocks.sh

echo "=== Fixing JavaScript Test Files ==="
./scripts/fix-js-tests.sh

echo "=== Identifying Unnecessary Escape Characters ==="
./scripts/fix-escape-chars.sh

# Run ESLint with ActionTypes rule
echo "=== Applying ActionTypes Rule ==="
npx eslint --fix "./app/**/*.{ts,tsx}" --rule "local/no-action-literals: warn"

echo "=== All automated fixes complete ==="
echo "Please review the generated reports for issues that need manual fixes."
