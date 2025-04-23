#!/bin/bash

# Fix unnecessary escape characters
echo "Finding files with unnecessary escape characters..."

# Find files with escape character issues
ESCAPE_CHAR_FILES=$(grep -l "Unnecessary escape character" <(npx eslint "./app/**/*.{ts,tsx}" --rule "no-useless-escape: error"))

if [ -n "$ESCAPE_CHAR_FILES" ]; then
  echo "The following files have unnecessary escape characters:"
  echo "$ESCAPE_CHAR_FILES" | tr ' ' '\n'
  
  # Generate detailed report
  echo "\nEscape character details:" > escape_chars_report.txt
  for file in $ESCAPE_CHAR_FILES; do
    echo "\n$file:" >> escape_chars_report.txt
    grep "Unnecessary escape character" <(npx eslint "$file" --rule "no-useless-escape: error") >> escape_chars_report.txt
  done
  
  echo "Detailed report saved to escape_chars_report.txt"
fi
