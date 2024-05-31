// source/components/Navigation.tsx

import { Item } from '../types.js';
import { findItemByIdInFilteredItems, flattenItems } from '../utils/itemUtils.js';

/**
 * Navigates to the next item in the list of expanded items.
 *
 * @param {string | null} currentItemId - The ID of the current item. If null, navigation starts from the first item.
 * @param {Item[]} expandedItems - The list of expanded items to navigate through.
 * @param {(itemId: string | null) => void} setCurrentItemId - A function to set the current item ID.
 */
export const navigateToNextItem = (currentItemId: string | null, expandedItems: Item[], setCurrentItemId: (itemId: string | null) => void) => {
    if (!currentItemId) {
        setCurrentItemId(expandedItems[0]?.id || null);
        return;
    }
    const currentItem = findItemByIdInFilteredItems(currentItemId, expandedItems);
    if (!currentItem) {
        return;
    }
    if (currentItem.isDirectory && currentItem.isExpanded && currentItem.children.length > 0) {
        setCurrentItemId(currentItem.children[0]?.id || null);
    } else {
        const flattenedItems = flattenItems(expandedItems);
        const currentIndex = flattenedItems.findIndex((item: Item) => item.id === currentItemId);
        const nextIndex = (currentIndex + 1) % flattenedItems.length;
        setCurrentItemId(flattenedItems[nextIndex]?.id || null);
    }
};

/**
 * Navigates to the previous item in the list of expanded items.
 *
 * @param {string | null} currentItemId - The ID of the current item. If null, no navigation occurs.
 * @param {Item[]} expandedItems - The list of expanded items to navigate through.
 * @param {(itemId: string | null) => void} setCurrentItemId - A function to set the current item ID.
 */
export const navigateToPreviousItem = (currentItemId: string | null, expandedItems: Item[], setCurrentItemId: (itemId: string | null) => void) => {
    if (!currentItemId) {
        return;
    }
    const flattenedItems = flattenItems(expandedItems);
    const currentIndex = flattenedItems.findIndex((item: Item) => item.id === currentItemId);
    const previousIndex = (currentIndex - 1 + flattenedItems.length) % flattenedItems.length;
    setCurrentItemId(flattenedItems[previousIndex]?.id || null);
};
