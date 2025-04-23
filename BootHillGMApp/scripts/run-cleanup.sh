#!/bin/bash
# Run all cleanup scripts

# Make scripts executable
chmod +x ./scripts/cleanup-duplicates.sh
chmod +x ./scripts/final-cleanup.sh
chmod +x ./scripts/remove-debug-logs.sh
chmod +x ./scripts/fix-decision-service-imports.sh
chmod +x ./scripts/action-types-cleanup.sh

# Run the final cleanup script
./scripts/final-cleanup.sh
