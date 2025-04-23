#!/bin/bash

# Fix functions used before definition
echo "Finding functions used before definition..."

# Find all files with this issue
FUNCTION_ORDER_FILES=$(grep -l "was used before it was defined" <(npx eslint "./app/**/*.{ts,tsx}" --rule "@typescript-eslint/no-use-before-define: error"))

if [ -n "$FUNCTION_ORDER_FILES" ]; then
  echo "The following files need function order fixes:"
  echo "$FUNCTION_ORDER_FILES" | tr ' ' '\n'
  
  # Generate report with specific functions that need to be moved
  echo "\nDetailed function issues:" > function_order_report.txt
  for file in $FUNCTION_ORDER_FILES; do
    echo "\n$file:" >> function_order_report.txt
    grep "was used before it was defined" <(npx eslint "$file" --rule "@typescript-eslint/no-use-before-define: error") >> function_order_report.txt
  done
  
  echo "Detailed report saved to function_order_report.txt"
fi
