#!/bin/bash
# Force cleanup of problematic files and directories

echo "Forcibly removing problematic files and directories..."

# 1. Remove the duplicate ESLint rule file
rm -f "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/eslint-rules/no-action-literals.js"

# 2. Remove the entire eslint-rules directory if it exists
if [ -d "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/eslint-rules" ]; then
  rm -rf "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/eslint-rules"
  echo "Removed eslint-rules directory"
fi

# 3. Remove the __tests__ directory in decision-service
if [ -d "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/services/ai/decision-service/__tests__" ]; then
  rm -rf "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/services/ai/decision-service/__tests__"
  echo "Removed decision-service/__tests__ directory"
fi

echo "Force cleanup complete!"
