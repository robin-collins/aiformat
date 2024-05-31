// source/components/ItemRenderer.tsx

import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import { Item } from '../types.js';

/**
 * Renders a list of items with indentation and highlights the current and selected items.
 *
 * @param {Item[]} items - The list of items to render.
 * @param {number} [indentationLevel=0] - The level of indentation for nested items.
 * @param {string | null} currentItemId - The ID of the current item to highlight.
 * @param {Item[]} selectedItems - The list of selected items to highlight.
 * @returns {ReactNode[]} An array of React nodes representing the rendered items.
 */
export const renderItems = (items: Item[], indentationLevel = 0, currentItemId: string | null, selectedItems: Item[]): ReactNode[] => {
    return items.map((item: Item) => (
        <Box key={item.path} flexDirection="column">
            <Box marginLeft={indentationLevel} key={item.id}>
                <Text color={item.id === currentItemId ? 'green' : selectedItems.find((selectedItem: Item) => selectedItem.id === item.id) ? 'cyan' : 'white'}>
                    {selectedItems.find((selectedItem: Item) => selectedItem.id === item.id) ? '[X]' : '[ ]'}{' '}
                    {item.isDirectory ? '🗂️ ' : '📄 '} {item.name}{item.isDirectory && "/"}
                </Text>
            </Box>
            {item.isDirectory && item.isExpanded && item.children.length > 0 && renderItems(item.children, indentationLevel + 1, currentItemId, selectedItems)}
        </Box>
    ));
};
