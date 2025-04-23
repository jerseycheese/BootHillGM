#!/bin/bash
# Final Cleanup Script for ActionTypes Implementation

echo "Performing final cleanup of ActionTypes implementation..."

# Make all scripts executable
chmod +x ./scripts/*.sh

# 1. Remove duplicate files
echo "=== Removing Duplicate Files ==="
./scripts/cleanup-duplicates.sh

# 2. Update documentation paths
echo "=== Ensuring Documentation Paths Are Correct ==="
DOCS_DIR="/Users/jackhaas/Projects/BootHillGM/Docs"
APP_DOCS_DIR="/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/docs"

# Copy docs from app directory to main Docs if they exist
if [ -d "${APP_DOCS_DIR}" ]; then
  echo "Copying documentation from app directory to main Docs directory..."
  cp -r "${APP_DOCS_DIR}"/* "${DOCS_DIR}/"
fi

# 3. Final cleanup of comments
echo "=== Cleaning Up Useless Comments ==="

# Search for files with "Intentionally empty" comments
find /Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "\/\* Intentionally empty \*\/" > /tmp/files_with_empty_comments.txt

# Process each file
if [ -f "/tmp/files_with_empty_comments.txt" ]; then
  while IFS= read -r file; do
    echo "Cleaning comments in ${file}..."
    
    # Create backup
    cp "${file}" "${file}.bak"
    
    # Replace empty object comments with just empty objects
    sed -i '' 's/{ \/\* Intentionally empty \*\/ }/{}/g' "${file}"
    sed -i '' 's/{\/\* Intentionally empty \*\/}/{}/g' "${file}"
    
    # Check if changes were made
    if cmp -s "${file}" "${file}.bak"; then
      echo "  No changes made to ${file}"
    else
      echo "  Removed useless comments from ${file}"
    fi
    
    # Remove backup
    rm "${file}.bak"
  done < /tmp/files_with_empty_comments.txt
  
  rm /tmp/files_with_empty_comments.txt
fi

echo "Final cleanup complete!"
