// types.ts

/**
 * Item interface representing a file or folder in the directory structure.
 *
 * @interface Item
 * @property {string} id - Unique identifier for the item.
 * @property {string} name - Name of the item.
 * @property {boolean} isDirectory - Flag indicating if the item is a directory.
 * @property {Item[]} children - Array of children items (if directory).
 * @property {string} path - Full path of the item.
 * @property {boolean} isExpanded - Flag indicating if the directory is expanded.
 * @property {number} level - Level of nesting in the directory structure.
 */
export interface Item {
	id: string;
	name: string;
	isDirectory: boolean;
	children: Item[];
	path: string;
	isExpanded: boolean;
	level: number;
}
