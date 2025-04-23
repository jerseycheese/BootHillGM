# ESLint Fix Scripts

These scripts help automate the process of fixing ESLint issues in the BootHillGM codebase.

## Usage

Make the scripts executable first:

```bash
chmod +x ./scripts/*.sh
```

Then run all fixes at once:

```bash
./scripts/run-all-fixes.sh
```

Or run individual scripts for specific issues:

- `./scripts/fix-duplicate-imports.sh` - Fix duplicate imports
- `./scripts/fix-function-order.sh` - Identify functions used before definition
- `./scripts/fix-unused-vars.sh` - Fix unused variables
- `./scripts/fix-empty-blocks.sh` - Identify empty block statements
- `./scripts/fix-js-tests.sh` - Fix JavaScript test files with Jest globals
- `./scripts/fix-escape-chars.sh` - Identify unnecessary escape characters

## Reports

The scripts generate detailed reports for issues that need manual intervention:

- `function_order_report.txt` - Lists functions that need to be moved up in their files
- `unused_vars_report.txt` - Lists unused variables that need to be prefixed with underscore
- `empty_blocks_report.txt` - Lists empty blocks that need comments or implementation
- `escape_chars_report.txt` - Lists unnecessary escape characters that need fixing

## Manual Fixes Required

Some issues will need manual intervention:

1. For duplicate imports: Consolidate the imports into a single statement
2. For function order: Move functions to the top of their containing scope or file
3. For empty blocks: Add comments explaining why the block is empty, or implement the block
4. For escape characters: Remove unnecessary escape characters

## ActionTypes Rule

The `local/no-action-literals` rule will identify string literals that should be replaced with ActionTypes constants.
