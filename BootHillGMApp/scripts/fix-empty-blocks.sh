#!/bin/bash

# Fix empty block statements
echo "Finding empty block statements..."

# Find files with empty blocks
EMPTY_BLOCK_FILES=$(grep -l "Empty block statement" <(npx eslint "./app/**/*.{ts,tsx}" --rule "no-empty: error"))

if [ -n "$EMPTY_BLOCK_FILES" ]; then
  echo "The following files contain empty blocks that need comments or implementation:"
  echo "$EMPTY_BLOCK_FILES" | tr ' ' '\n'
  
  # Generate detailed report
  echo "\nEmpty blocks details:" > empty_blocks_report.txt
  for file in $EMPTY_BLOCK_FILES; do
    echo "\n$file:" >> empty_blocks_report.txt
    grep "Empty block statement" <(npx eslint "$file" --rule "no-empty: error") >> empty_blocks_report.txt
  done
  
  echo "Detailed report saved to empty_blocks_report.txt"
fi
