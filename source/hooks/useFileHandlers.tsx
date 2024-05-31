// source/hooks/useFileHandlers.tsx

import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import fastIgnore from 'fast-ignore';
import { Item } from '../types.js';
import { EXCLUDED_FOLDERS } from '../constants.js';

/**
 * Custom hook to handle file and folder operations.
 *
 * @returns An object containing the list of items (files and folders), a function to update the list, and the .gitignore rules.
 */
export const useFileHandlers = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [gitignoreRules, setGitignoreRules] = useState<string[]>([]);
    const [isGitignorePresent, setIsGitignorePresent] = useState(false);

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
     * @param ignore Function to check if a file/folder should be ignored.
     * @returns An array of items (files and folders) in the directory.
     */
    const loadFilesAndFolders = (dirPath: string, level: number = 0, ignore: (filePath: string) => boolean): Item[] => {
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

            if (!EXCLUDED_FOLDERS.includes(item) && !ignore(itemPath)) {
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
                    newItem.children = loadFilesAndFolders(itemPath, level + 1, ignore);
                }

                items.push(newItem);
            }
        }

        return items;
    };

    useEffect(() => {
        const gitignorePath = path.join(process.cwd(), '.gitignore');
        let ignore: (filePath: string) => boolean = () => false;

        if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            ignore = fastIgnore(gitignoreContent);
            setGitignoreRules(gitignoreContent.split(/\r?\n/).filter(line => line.trim() !== '' && !line.startsWith('#')));
            setIsGitignorePresent(true);
        }

        const items = loadFilesAndFolders(process.cwd(), 0, ignore);
        setItems(items);
    }, []);

    return { items, setItems, gitignoreRules, isGitignorePresent };
};
