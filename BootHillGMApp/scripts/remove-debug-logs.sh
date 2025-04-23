#!/bin/bash
# Debug Console Removal Script
# This script removes all debug console.logs, .warns, and .errors related to action types implementation

# Set the root directory of the project
PROJECT_ROOT="$(pwd)"
APP_DIR="${PROJECT_ROOT}/app"
echo "Removing debug console logs from ${APP_DIR}..."

# Find all files containing console.log statements
grep -r --include="*.ts" --include="*.tsx" -l "console\.log" "${APP_DIR}" > /tmp/files_with_console.txt

# Process each file
while read -r file; do
  # Look for debug console.logs related to ActionTypes implementation
  if grep -q -E "console\.log.*[aA]ction[tT]ype|console\.log.*combat.*state|console\.log.*[dD]ebug|console\.warn.*handler.*not.*available" "${file}"; then
    echo "Processing ${file}..."
    
    # Create backup
    cp "${file}" "${file}.bak"
    
    # Remove debug logs but keep important error handling
    sed -i '' -E '/console\.log.*[aA]ction[tT]ype/d' "${file}"
    sed -i '' -E '/console\.log.*combat.*state/d' "${file}"
    sed -i '' -E '/console\.log.*[dD]ebug/d' "${file}"
    sed -i '' -E '/console\.warn.*handler.*not.*available/d' "${file}"
    sed -i '' -E '/console\.log.*[eE]rror.*creating.*handler/d' "${file}"
    sed -i '' -E '/console\.log.*[tT]est.*ActionTypes/d' "${file}"
    
    # Only report if changes were made
    if ! cmp -s "${file}" "${file}.bak"; then
      echo "  Removed debug logs from ${file}"
    else
      echo "  No debug logs found in ${file}"
    fi
    
    # Remove backup
    rm "${file}.bak"
  fi
done < /tmp/files_with_console.txt

# Cleanup
rm /tmp/files_with_console.txt

echo "Debug console log removal complete!"
