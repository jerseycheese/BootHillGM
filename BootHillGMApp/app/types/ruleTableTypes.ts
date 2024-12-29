/**
 * Represents a rule table.
 */
interface RuleTable {
  id: string;
  name: string;
  description: string;
  entries: TableEntry[];
  modifiers?: TableModifier[];
}

/**
 * Represents an entry in a rule table.
 */
interface TableEntry {
  roll: number | [number, number]; // Single number or range
  result: string;
  effect?: string;
  modifiers?: string[];
}

/**
 * Represents a modifier for a rule table.
 */
interface TableModifier {
  condition: string;
  modifier: number;
}

export type { RuleTable, TableEntry, TableModifier };