// source/hooks/useSearchHandlers.tsx

import { useState } from 'react';
import { Item } from '../types.js';

/**
 * Custom hook for handling search functionality.
 *
 * @param items - The list of items to be searched.
 * @returns An object containing the search query, a function to update the search query, and the filtered list of items based on the search query.
 */
export const useSearchHandlers = (items: Item[]): {
    searchQuery: string;
    setSearchQuery:  React.Dispatch<React.SetStateAction<string>>;
    filteredItems: Item[];
} => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    /**
     * Searches the given list of items based on the provided query.
     *
     * @param items - The list of items to be searched.
     * @param query - The search query.
     * @returns The filtered list of items based on the search query.
     */
    const searchItems = (items: Item[], query: string): Item[] => {
        return items.reduce((result, item) => {
            if (item.isDirectory) {
                const matchingChildren = searchItems(item.children, query);
                if (matchingChildren.length > 0) {
                    const expandedItem = { ...item, isExpanded: true, children: matchingChildren };
                    result.push(expandedItem);
                }
            } else if (item.name.toLowerCase().includes(query.toLowerCase())) {
                result.push(item);
            }
            return result;
        }, [] as Item[]);
    };

    /**
     * Filters the list of items based on the current search query.
     *
     * @returns The filtered list of items based on the search query.
     */
    const filteredItems = searchQuery ? searchItems(items, searchQuery) : items;

    return { searchQuery, setSearchQuery, filteredItems };
};
