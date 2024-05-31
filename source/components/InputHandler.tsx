// source/components/InputHandler.tsx

import { Key } from "ink";

/**
 * Handles various input events and performs corresponding actions.
 *
 * @param {string} input - The input string from the user.
 * @param {Key} key - The key object representing the pressed key.
 * @param {(query: string) => void} setSearchQuery - Function to update the search query.
 * @param {() => void} navigateToNextItem - Function to navigate to the next item.
 * @param {() => void} navigateToPreviousItem - Function to navigate to the previous item.
 * @param {() => void} toggleFolderExpansion - Function to toggle the expansion of a folder.
 * @param {() => void} toggleSelection - Function to toggle the selection of an item.
 * @param {() => void} copyContentsOfFilesAndFolders - Function to copy the contents of files and folders.
 */
export const handleInput = (
  input: string,
  key: Key,
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
	navigateToNextItem: () => void,
  navigateToPreviousItem: () => void,
  toggleFolderExpansion: () => void,
  toggleSelection: () => void,
  copyContentsOfFilesAndFolders: () => void
) => {
  if (key.return) {
    copyContentsOfFilesAndFolders();
    return;
  }
  if (input) {
    setSearchQuery((prev) => prev + input);
  }
  if (key.backspace || key.delete) {
    setSearchQuery((prev) => prev.slice(0, -1));
  }
  if (key.downArrow) {
    navigateToNextItem();
  }
  if (key.upArrow) {
    navigateToPreviousItem();
  }
  if (key.tab) {
    toggleFolderExpansion();
  }
  if (key.leftArrow || key.rightArrow) {
    toggleSelection();
  }
};
