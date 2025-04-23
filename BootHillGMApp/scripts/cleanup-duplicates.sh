#!/bin/bash
# Script to clean up duplicate files and directories

echo "Cleaning up duplicate files and directories..."

# 1. Remove the standalone eslint rule file (keep the one in the plugin)
if [ -f "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/eslint-rules/no-action-literals.js" ]; then
  echo "Removing duplicate ESLint rule file..."
  rm "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/eslint-rules/no-action-literals.js"
  
  # Check if the directory is empty now
  if [ -z "$(ls -A /Users/jackhaas/Projects/BootHillGM/BootHillGMApp/eslint-rules)" ]; then
    echo "ESLint rules directory is empty, removing it..."
    rmdir "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/eslint-rules"
  fi
fi

# 2. Ensure the decision service enhanced test file is removed
if [ -f "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/services/ai/decision-service/__tests__/decision-generator-enhanced.test.ts" ]; then
  echo "Removing decision-generator-enhanced.test.ts..."
  rm "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/services/ai/decision-service/__tests__/decision-generator-enhanced.test.ts"
fi

# 3. Ensure all __tests__ directories in service files are removed
if [ -d "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/services/ai/decision-service/__tests__" ]; then
  echo "Removing decision-service/__tests__ directory..."
  rm -rf "/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/services/ai/decision-service/__tests__"
fi

echo "Cleanup complete!"
