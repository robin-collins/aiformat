// source/utils/itemUtils.ts

import { Item } from '../types.js';

/**
 * Recursively retrieves all items within a given folder.
 *
 * @param {Item} folder - The folder from which to retrieve items.
 * @returns {Item[]} - An array of all items within the given folder and its subfolders.
 */
export const getItemsFromFolder = (folder: Item): Item[] => {
    const items: Item[] = [];
    const traverseItems = (item: Item) => {
        items.push(item);
        if (item.isDirectory) {
            item.children.forEach(traverseItems);
        }
    };
    traverseItems(folder);
    return items;
};

/**
 * Finds an item by its id in the given list of items.
 * If the item is a directory and is expanded, it will also search within its children.
 *
 * @param {string} itemId - The id of the item to find.
 * @param {Item[]} items - The list of items to search in.
 * @returns {Item | undefined} - The found item, or undefined if not found.
 */
export const findItemByIdInFilteredItems = (itemId: string, items: Item[]): Item | undefined => {
    for (const item of items) {
        if (item.id === itemId) {
            return item;
        }
        if (item.isDirectory && item.isExpanded) {
            const foundItem = findItemByIdInFilteredItems(itemId, item.children);
            if (foundItem) {
                return foundItem;
            }
        }
    }
    return undefined;
};

/**
 * Finds an item by its id in the given list of items.
 * If the item is a directory, it will also search within its children.
 *
 * @param {string} itemId - The id of the item to find.
 * @param {Item[]} items - The list of items to search in.
 * @returns {Item | undefined} - The found item, or undefined if not found.
 */
export const findItemById = (itemId: string, items: Item[]): Item | undefined => {
    for (const item of items) {
        if (item.id === itemId) {
            return item;
        }
        if (item.isDirectory) {
            const foundItem = findItemById(itemId, item.children);
            if (foundItem) {
                return foundItem;
            }
        }
    }
    return undefined;
};

/**
 * Flattens the given list of items and their children into a single array.
 *
 * @param {Item[]} items - The list of items to flatten.
 * @returns {Item[]} - The flattened array of items.
 */
export const flattenItems = (items: Item[]): Item[] => {
    const flattenedItems: Item[] = [];

    const traverseItems = (items: Item[]) => {
        for (const item of items) {
            flattenedItems.push(item);
            if (item.isDirectory && item.isExpanded) {
                traverseItems(item.children);
            }
        }
    };

    traverseItems(items);
    return flattenedItems;
};

/**
 * Expands the parent folders of the given item in the list of items.
 *
 * @param {Item} item - The item whose parent folders should be expanded.
 * @param {Item[]} items - The list of items to modify.
 * @returns {Item[]} - The modified list of items with the parent folders of the given item expanded.
 */
export const expandParentFolders = (item: Item, items: Item[]): Item[] => {
    return items.map((i: Item) => {
        if (i.id === item.id) {
            return { ...i, isExpanded: true };
        }
        if (i.isDirectory && item.path.startsWith(i.path)) {
            return { ...i, isExpanded: true, children: expandParentFolders(item, i.children) };
        }
        return i;
    });
};
