#!/bin/bash
# Script to fix import paths in decision service files

# Set the directory to work on
DIR="/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/services/ai/decision-service"
echo "Fixing imports in ${DIR}..."

# Map of old import names to new camelCase names
declare -A FILE_MAP=(
  ["./decision-detector"]="./decisionDetector"
  ["./decision-generator"]="./decisionGenerator"
  ["./decision-history"]="./decisionHistory"
  ["./decision-history-service"]="./decisionHistoryService"
  ["./decision-service"]="./decisionService"
  ["./narrative-decision-detector"]="./narrativeDecisionDetector"
  ["./ai-client"]="./aiClient"
  ["./ai-service-client"]="./aiServiceClient"
)

# Process each file in the directory
for file in "${DIR}"/*.ts; do
  # Skip index.ts as we've already fixed it
  if [[ "${file}" == "${DIR}/index.ts" ]]; then
    continue
  fi
  
  echo "Processing ${file}..."
  
  # Create backup
  cp "${file}" "${file}.bak"
  
  # Replace import paths
  for old_path in "${!FILE_MAP[@]}"; do
    new_path=${FILE_MAP[$old_path]}
    sed -i '' "s|from '${old_path}'|from '${new_path}'|g" "${file}"
    sed -i '' "s|from \"${old_path}\"|from \"${new_path}\"|g" "${file}"
  done
  
  # Check if changes were made
  if cmp -s "${file}" "${file}.bak"; then
    echo "  No changes needed in ${file}"
  else
    echo "  Updated import paths in ${file}"
  fi
  
  # Remove backup
  rm "${file}.bak"
done

# Fix imports in test files
TEST_DIR="/Users/jackhaas/Projects/BootHillGM/BootHillGMApp/app/__tests__/services/ai/decision-service"
if [ -d "${TEST_DIR}" ]; then
  echo "Fixing imports in test files..."
  
  for file in "${TEST_DIR}"/*.ts "${TEST_DIR}"/*.tsx; do
    if [ -f "${file}" ]; then
      echo "Processing test file ${file}..."
      
      # Create backup
      cp "${file}" "${file}.bak"
      
      # Replace import paths - for test files import from the service directory
      for old_name in "${!FILE_MAP[@]}"; do
        # Extract just the filename without path
        old_basename=$(basename "${old_name}")
        new_basename=$(basename "${FILE_MAP[$old_name]}")
        
        # Update the full import path
        old_import="../../../../services/ai/decision-service/${old_basename}"
        new_import="../../../../services/ai/decision-service/${new_basename}"
        
        sed -i '' "s|from '${old_import}'|from '${new_import}'|g" "${file}"
        sed -i '' "s|from \"${old_import}\"|from \"${new_import}\"|g" "${file}"
      done
      
      # Check if changes were made
      if cmp -s "${file}" "${file}.bak"; then
        echo "  No changes needed in ${file}"
      else
        echo "  Updated import paths in ${file}"
      fi
      
      # Remove backup
      rm "${file}.bak"
    fi
  done
fi

echo "Import path fixes complete!"
