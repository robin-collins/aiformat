// source/components/Handlers.tsx

import React, { ReactNode } from 'react';
import { Text } from 'ink';
import clipboard from 'clipboardy';
import { outputXml } from '../utils/generateOutput.js';
import { Item } from '../types.js';
import { findItemById, getItemsFromFolder, flattenItems } from '../utils/itemUtils.js';

/**
 * Copies the contents of the selected files and folders to the clipboard and sets a success message.
 *
 * @param {Item[]} selectedItems - An array of selected items (files and folders) to be copied.
 * @param {function(ReactNode): void} setMessage - A function to set the message to be displayed.
 */
export const copyContentsOfFilesAndFolders = (selectedItems: Item[], setMessage: (message: ReactNode) => void) => {
    const files = outputXml(selectedItems);
    clipboard.writeSync(files.content);
    setMessage(
        <Text color="white">✨ Successfully copied <Text color="cyan">{files.fileCount}</Text> file{files.fileCount > 1 && "s"} to clipboard</Text>
    );
    setTimeout(() => {
        process.exit(0);
    }, 300);
};

/**
 * Toggles the selection state of a given item (file or folder). If the item is a folder, it will toggle the selection state of all items within the folder.
 *
 * @param {string | null} currentItemId - The ID of the current item to be toggled.
 * @param {Item[]} items - An array of all items (files and folders).
 * @param {Item[]} selectedItems - An array of currently selected items.
 * @param {function(Item[]): void} setSelectedItems - A function to update the selected items.
 */
export const toggleSelection = (currentItemId: string | null, items: Item[], selectedItems: Item[], setSelectedItems: (items: Item[]) => void) => {
    if (!currentItemId) {
        return;
    }

    /**
     * Finds the item with the specified ID from the list of items.
     * If the item is not found, the function returns early.
     *
     * @param {string | null} currentItemId - The ID of the current item to be found.
     * @param {Item[]} items - An array of all items (files and folders).
     * @returns {Item | undefined} - The found item or undefined if not found.
     */
    const currentItem = findItemById(currentItemId, items);
    if (!currentItem) {
        return;
    }

    /**
     * Toggles the selection state of a given item (file or folder). If the item is a folder, it will toggle the selection state of all items within the folder.
     *
     * @param {string | null} currentItemId - The ID of the current item to be toggled.
     * @param {Item[]} items - An array of all items (files and folders).
     * @param {Item[]} selectedItems - An array of currently selected items.
     * @param {function(Item[]): void} setSelectedItems - A function to update the selected items.
     */
    if (currentItem.isDirectory) {
        // Get all items within the folder
        const itemsInFolder = getItemsFromFolder(currentItem);
        // Check if all items in the folder are selected
        const allItemsInFolderAreSelected = itemsInFolder.every((item: Item) => selectedItems.includes(item));
        if (allItemsInFolderAreSelected) {
            // If all items are selected, deselect them
            setSelectedItems(selectedItems.filter((item: Item) => !itemsInFolder.find((i: Item) => i.id === item.id)));
        } else {
            // If not all items are selected, select all items in the folder
            const newSelectedItems = selectedItems.filter((item: Item) => !itemsInFolder.find((i: Item) => i.id === item.id));
            setSelectedItems([...newSelectedItems, ...itemsInFolder]);
        }
    } else {
        // If the current item is not a directory, toggle its selection state
        if (selectedItems.find((item: Item) => item.id === currentItem.id)) {
            // If the item is already selected, deselect it
            setSelectedItems(selectedItems.filter((item: Item) => item.id !== currentItem.id));
        } else {
            // If the item is not selected, select it
            setSelectedItems([...selectedItems, currentItem]);
        }
    }
};

/**
 * Toggles the expansion state of a folder. If the folder is currently expanded, it will be collapsed, and vice versa.
 *
 * @param {string | null} currentItemId - The ID of the current item (folder) to be toggled.
 * @param {Item[]} items - An array of all items (files and folders).
 * @param {function(Item[]): void} setItems - A function to update the items with the new expansion state.
 * @returns {void} - The function does not return a value. It updates the state of the items.
 */
export const toggleFolderExpansion = (currentItemId: string | null, items: Item[], setItems: (items: Item[]) => void) => {
    if (!currentItemId) {
        return;
    }

    /**
     * Finds the item with the specified ID from the list of items.
     * If the item is found and it is a directory, toggles its expansion state.
     *
     * @param {string | null} currentItemId - The ID of the current item to be found and toggled.
     * @param {Item[]} items - An array of all items (files and folders).
     * @returns {void} - The function does not return a value. It updates the expansion state of the item if it is a directory.
     */
    const currentItem = findItemById(currentItemId, items);
    if (currentItem && currentItem.isDirectory) {
        currentItem.isExpanded = !currentItem.isExpanded;
    }
    // Updates the state of items with the new expansion state of the current item.
    // If the item's ID matches the current item's ID, it returns the updated current item.
    // Otherwise, it returns the original item.
    //
    // @param {Item[]} items - An array of all items (files and folders).
    // @param {Item | undefined} currentItem - The current item to be updated.
    // @returns {Item[]} - The updated array of items with the new expansion state.
    setItems(items.map((item: Item) => {
        if (item.id === currentItem?.id) {
            return currentItem;
        }
        return item;
    }));
};

/**
 * Selects or deselects all visible items.
 *
 * @param {Item[]} items - The array of visible items (files and folders).
 * @param {Item[]} selectedItems - The array of currently selected items.
 * @param {function(Item[]): void} setSelectedItems - A function to update the selected items.
 */
export const toggleSelectAll = (items: Item[], selectedItems: Item[], setSelectedItems: (items: Item[]) => void) => {
	const flattenedItems = flattenItems(items);
	const allItemsSelected = flattenedItems.every(item => selectedItems.some(selectedItem => selectedItem.id === item.id));
	if (allItemsSelected) {
			setSelectedItems(selectedItems.filter(item => !flattenedItems.some(flattenedItem => flattenedItem.id === item.id)));
	} else {
			setSelectedItems([...selectedItems, ...flattenedItems.filter(item => !selectedItems.some(selectedItem => selectedItem.id === item.id))]);
	}
};
