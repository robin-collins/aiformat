// source/hooks/useFileHandlers.tsx

import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import { Item } from '../types.js';
import { EXCLUDED_FOLDERS } from '../constants.js';

/**
 * Custom hook to handle file and folder operations.
 *
 * @returns An object containing the list of items (files and folders) and a function to update the list.
 */
export const useFileHandlers = () => {
    const [items, setItems] = useState<Item[]>([]);

    /**
     * Generates a unique ID for an item based on its path.
     *
     * @param itemPath The path of the item.
     * @returns A unique ID for the item.
     */
    const generateId = (itemPath: string): string => {
        return itemPath;
    };

    /**
     * Loads files and folders from a directory path.
     *
     * @param dirPath The path of the directory to load files and folders from.
     * @param level The current level of the directory hierarchy.
     * @returns An array of items (files and folders) in the directory.
     */
    const loadFilesAndFolders = (dirPath: string, level: number = 0): Item[] => {
        const items: Item[] = [];
        const dirItems = fs.readdirSync(dirPath);
        const sortedItems = dirItems.sort((a, b) => {
            const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
            const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });

        for (const item of sortedItems) {
            const itemPath = path.join(dirPath, item);
            const isDirectory = fs.statSync(itemPath).isDirectory();
            const id = generateId(itemPath);

            if (!EXCLUDED_FOLDERS.includes(item)) {
                const newItem: Item = {
                    id,
                    name: item,
                    isDirectory,
                    children: [],
                    path: itemPath,
                    isExpanded: false,
                    level,
                };

                if (isDirectory) {
                    newItem.children = loadFilesAndFolders(itemPath, level + 1);
                }

                items.push(newItem);
            }
        }

        return items;
    };

    useEffect(() => {
        const items = loadFilesAndFolders(process.cwd());
        setItems(items);
    }, []);

    return { items, setItems };
};
