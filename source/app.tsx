// source/app.tsx

import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useFileHandlers } from './hooks/useFileHandlers.js';
import { useSearchHandlers } from './hooks/useSearchHandlers.js';
import { renderItems } from './components/ItemRenderer.js';
import { navigateToNextItem, navigateToPreviousItem } from './components/Navigation.js';
import { toggleFolderExpansion, toggleSelection, copyContentsOfFilesAndFolders } from './components/Handlers.js';
import { handleInput } from './components/InputHandler.js';
import { getItemsFromFolder, expandParentFolders } from './utils/itemUtils.js';
import { Item } from './types.js';

// Clear console
process.stdout.write('\x1Bc');

/**
 * The main component of the application.
 *
 * This component handles the state and user input for navigating and selecting files and folders.
 * It uses various hooks to manage file handling, search functionality, and user input.
 */
const App: FC = () => {
    // State and handlers for managing file items
    const { items, setItems } = useFileHandlers();

    // State and handlers for managing search functionality
    const { searchQuery, setSearchQuery, filteredItems } = useSearchHandlers(items);

    // State for the currently selected item ID
    const [currentItemId, setCurrentItemId] = useState<string | null>(null);

    // State for the list of selected items
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    // State for displaying messages to the user
    const [message, setMessage] = useState<ReactNode | null>(null);

    /**
     * Handles user input for navigating and selecting items.
     *
     * @param input - The input character from the user.
     * @param key - The key object containing information about the pressed key.
     */
    useInput((input, key) => {
        handleInput(
            input,
            key,
            setSearchQuery,
            () => navigateToNextItem(currentItemId, expandedItems, setCurrentItemId),
            () => navigateToPreviousItem(currentItemId, expandedItems, setCurrentItemId),
            () => toggleFolderExpansion(currentItemId, items, setItems),
            () => toggleSelection(currentItemId, items, selectedItems, setSelectedItems),
            () => copyContentsOfFilesAndFolders(selectedItems, setMessage)
        );
    });

    /**
     * Expands the list of filtered items to include parent folders of expanded directories.
     *
     * This function iterates over the filtered items and checks if an item is a directory and is expanded.
     * If so, it calls `expandParentFolders` to include the parent folders of the expanded directory in the result.
     *
     * @param result - The accumulated list of items, initially set to the filtered items.
     * @param item - The current item being processed in the reduce function.
     * @returns The updated list of items including parent folders of expanded directories.
     */
    const expandedItems = filteredItems.reduce((result: Item[], item: Item) => {
        if (item.isDirectory && item.isExpanded) {
            return expandParentFolders(item, result);
        }
        return result;
    }, filteredItems);

    useEffect(() => {
        /**
         * Sets the current item ID based on the search query and the expanded items.
         *
         * This effect runs whenever the search query changes. It determines the first file
         * that is not a directory from the expanded items and sets it as the current item ID.
         * If the first item is a directory, it retrieves the items within that directory and
         * sets the first non-directory item as the current item ID.
         *
         * @param {string} searchQuery - The current search query entered by the user.
         * @param {Array} expandedItems - The list of items that are expanded and visible.
         * @param {Function} setCurrentItemId - Function to set the current item ID.
         * @param {Function} getItemsFromFolder - Function to get items from a specified folder.
         */
        const firstFile = expandedItems[0];
        if (firstFile && firstFile.isDirectory) {
            const itemsInFolder = getItemsFromFolder(firstFile);
            const firstItem = itemsInFolder.find((item: Item) => !item.isDirectory);
            if (searchQuery === "") {
                setCurrentItemId(firstFile.id);
            } else {
                setCurrentItemId(firstItem?.id || null);
            }
        } else {
            if (firstFile) {
                setCurrentItemId(firstFile.id);
            }
        }
    }, [searchQuery]);

    return (
        <Box flexDirection="column" marginTop={2} marginBottom={2}>
            <Box flexDirection="column" marginBottom={1}>
                <Text>Select files and folders to include.</Text>
                <Text>
                    Selected files: <Text color="cyan">{selectedItems.length}</Text>
                </Text>
                <Text>
                    Search query: {searchQuery ? searchQuery : <Text color="gray" italic>None</Text>}
                </Text>
            </Box>
            <Box marginBottom={1} flexDirection="column">
                {renderItems(expandedItems, 0, currentItemId, selectedItems)}
                {expandedItems.length === 0 && <Text color="gray" italic>No items found</Text>}
            </Box>
            <Box flexDirection="column">
                <Text>
                    Use <Text color="green">Up</Text> / <Text color="green">Down</Text> to
                    navigate, and <Text color="green">Left</Text> /{' '}
                    <Text color="green">Right</Text> to select
                </Text>
                <Text>
                    Use <Text color="green">Tab</Text> to expand/collapse, and{' '}
                    <Text color="green">Enter</Text> to copy selected files.
                </Text>
            </Box>
            <Box marginTop={1}>
                {message && <Text>{message}</Text>}
            </Box>
        </Box>
    );
};
export default App;
