# ESLint Fix Scripts

## Overview

This document describes the utility scripts created for automatically fixing common ESLint issues and enforcing code standards in the BootHillGM codebase. These scripts help maintain consistent code quality by addressing common issues automatically.

## Available Scripts

All scripts are located in the `/scripts` directory:

| Script | Purpose |
|--------|---------|
| `fix-duplicate-imports.sh` | Removes duplicate import statements from files |
| `fix-unused-vars.sh` | Identifies and fixes unused variables |
| `fix-empty-blocks.sh` | Identifies empty code blocks that may need implementation |
| `fix-function-order.sh` | Checks for proper function ordering in files |
| `fix-js-tests.sh` | Converts JavaScript test files to TypeScript |
| `fix-escape-chars.sh` | Fixes unnecessary escape characters in strings |
| `remove-debug-logs.sh` | Removes debug console logs related to action types |
| `run-all-fixes.sh` | Runs all scripts in the appropriate sequence |

## Using the Scripts

### Running Individual Scripts

Each script can be run individually to address specific issues:

```bash
# First make the script executable
chmod +x ./scripts/fix-unused-vars.sh

# Then run it
./scripts/fix-unused-vars.sh
```

### Running All Fixes

To run all fix scripts in the recommended sequence:

```bash
chmod +x ./scripts/run-all-fixes.sh
./scripts/run-all-fixes.sh
```

## Script Details

### fix-duplicate-imports.sh

This script identifies and removes duplicate import statements from TypeScript and React files.

**What it does:**
- Finds files with multiple import statements for the same module
- Consolidates imports to eliminate duplicates
- Preserves comments and formatting

### fix-unused-vars.sh

Identifies and either removes or comments out unused variables, parameters, and imports.

**What it does:**
- Detects unused variables and imports
- Removes simple unused imports
- Comments out complex cases that might need manual review

### fix-empty-blocks.sh

Identifies empty code blocks and generates a report of locations that need implementation.

**What it does:**
- Finds empty function bodies, if/else blocks, and try/catch blocks
- Generates a report of files and line numbers where implementation is needed
- Does not modify code automatically (report only)

### fix-function-order.sh

Checks for proper function ordering based on our coding conventions.

**What it does:**
- Analyzes files for function ordering issues
- Generates a report of files where functions might need reordering
- Does not modify code automatically (report only)

### fix-js-tests.sh

Converts JavaScript test files to TypeScript for better type safety.

**What it does:**
- Identifies .js test files
- Converts them to .tsx or .ts as appropriate
- Updates imports and syntax where needed

### fix-escape-chars.sh

Fixes unnecessary escape characters in strings.

**What it does:**
- Finds unnecessary escapes (e.g., `\'` in double-quoted strings)
- Removes unnecessary escape characters
- Preserves necessary escapes

### remove-debug-logs.sh

Removes debug console logs specifically related to action types implementation.

**What it does:**
- Finds console.log statements related to action types
- Removes debug-specific console logs
- Preserves important error handling logs

### run-all-fixes.sh

Master script that runs all fixes in the appropriate sequence.

**What it does:**
- Makes all scripts executable
- Runs each individual script in the proper order
- Applies the ActionTypes ESLint rule
- Generates a summary report of issues that need manual attention

## Best Practices

1. **Always commit your changes** before running fix scripts
2. **Review changes** made by the scripts before committing
3. **Run tests** after applying automated fixes to verify functionality
4. Use these scripts as part of your **regular development workflow**
5. **Report any issues** with the scripts to maintain their effectiveness

## Extending the Scripts

To add new scripts to the collection:

1. Create a new script in the `/scripts` directory
2. Make it executable: `chmod +x ./scripts/your-new-script.sh`
3. Add it to the `run-all-fixes.sh` master script if appropriate
4. Update this documentation to include the new script

## Troubleshooting

If you encounter issues with the scripts:

- Ensure you have the necessary permissions to execute the scripts
- Make sure you're running the scripts from the project root directory
- Check that you have the required dependencies installed
- Verify that your bash version is compatible (bash 4.0+)
