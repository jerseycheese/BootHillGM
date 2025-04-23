#!/bin/bash
# Script to remove useless comments from code files

# Set directory
DIR="/Users/jackhaas/Projects/BootHillGM/BootHillGMApp"
echo "Scanning for useless comments in ${DIR}..."

# Define patterns for useless comments
PATTERNS=(
  "\/\*\* *Intentionally empty \*\/"         # /** Intentionally empty */
  "\/\* *Intentionally empty \*\/"          # /* Intentionally empty */
  "\/\/ *Intentionally empty"               # // Intentionally empty
  "\/\* *\*\/"                              # Empty comments /* */
  "\/\/ *$"                                 # Empty line comments //
  "\/\/ *\.\.\."                            # // ...
  "\/\/ *more cases"                        # // ...more cases
  "\/\/ *more types"                        # // ...more types
  "\/\/ *other cases"                       # // ...other cases
)

# Build the find command with extensions
find_cmd="find ${DIR} -type f \( -name \"*.ts\" -o -name \"*.tsx\" \) -not -path \"*/node_modules/*\" -not -path \"*/dist/*\""

# Execute find command to get list of files
files=$(eval "$find_cmd")

# Process each file
for file in $files; do
  modified=false
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Apply patterns
  for pattern in "${PATTERNS[@]}"; do
    # Check if the pattern exists before trying to remove it
    if grep -q -E "$pattern" "$file"; then
      sed -i '' -E "s/$pattern//g" "$file"
      modified=true
    fi
  done
  
  # Clean up empty lines created by comment removal
  if $modified; then
    # Replace multiple consecutive empty lines with a single empty line
    sed -i '' -E '/^[[:space:]]*$/N;/^\n[[:space:]]*$/D' "$file"
    echo "Cleaned comments in: $file"
  fi
  
  # If no changes, remove the backup
  if ! $modified; then
    rm "$file.bak"
  else
    # If changes were made, keep the backup in case of problems
    mv "$file.bak" "$file.bak.save"
  fi
done

echo "Comment cleanup complete!"
