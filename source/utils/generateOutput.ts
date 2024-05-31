import fs from 'fs';
import { AsciiTree } from 'oo-ascii-tree';

// Define version number
export const GENERATE_OUTPUT_VERSION = "0.1.0"; // Incremented version number

interface FileOrFolder {
    id: string;
    name: string;
    isDirectory: boolean;
    children: FileOrFolder[];
    path: string;
    isExpanded: boolean;
    level: number;
}

/**
 * Cleans up the file tree by removing duplicates based on ID.
 * @param {FileOrFolder[]} fileTree - The file tree to be cleaned up.
 * @returns {FileOrFolder[]} - The cleaned-up file tree.
 */
const cleanupFileTree = (fileTree: FileOrFolder[]): FileOrFolder[] => {
    const idSet = new Set<string>();

    function traverse(node: FileOrFolder) {
        if (idSet.has(node.id)) {
            return null;
        }
        idSet.add(node.id);

        if (node.isDirectory) {
            node.children = node.children.map(traverse).filter(Boolean) as FileOrFolder[];
        }

        return node;
    }

    return fileTree.map(traverse).filter(Boolean) as FileOrFolder[];
};

/**
 * Generates an ASCII file tree using oo-ascii-tree package.
 * @param {FileOrFolder[]} fileTree - The file tree to be converted to ASCII.
 * @returns {string} - The generated ASCII file tree.
 */
const generateAsciiTree = (fileTree: FileOrFolder[]): string => {
    const root = new AsciiTree('root');

    const buildTree = (node: FileOrFolder, parent: AsciiTree) => {
        const treeNode = new AsciiTree(node.name);
        parent.add(treeNode);

        if (node.isDirectory) {
            node.children.forEach(child => buildTree(child, treeNode));
        }
    };

    fileTree.forEach(node => buildTree(node, root));

    return root.toString();
};

/**
 * Formats the date to the desired format.
 * @param {Date} date - The date to be formatted.
 * @returns {string} - The formatted date string.
 */
const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options).replace(',', '');
};

/**
 * Generates XML and a list of file paths with last modified times from the file tree.
 * @param {FileOrFolder[]} fileTree - The file tree to be converted to XML.
 * @returns {{ content: string, fileCount: number, filePaths: string[] }} - The generated XML, file count and file paths.
 */
export const outputXml = (fileTree: FileOrFolder[]): {
    content: string;
    fileCount: number;
    filePaths: string[];
} => {
    const cleanedFileTree = cleanupFileTree(fileTree);
    const filePaths: string[] = [];

    function generateXml(node: FileOrFolder, parentPath: string = ''): string {
        const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

        if (node.isDirectory) {
            const childXml = node.children.map(child => generateXml(child, currentPath)).join('\n');
            return `<folder name="${currentPath}">\n${childXml}\n</folder>`;
        } else {
            const fileContent = fs.readFileSync(node.path, 'utf8');
            const stats = fs.statSync(node.path);
            const modifiedTime = formatDate(new Date(stats.mtime));
            filePaths.push(`[  ${modifiedTime} ] ./${currentPath}`);
            return `<file name="${currentPath}">\n${fileContent}\n</file>`;
        }
    }

    function countFiles(node: FileOrFolder): number {
        if (node.isDirectory) {
            return node.children.reduce((acc, child) => acc + countFiles(child), 0);
        } else {
            return 1;
        }
    }

    // Generate XML content
    const content = cleanedFileTree.map(node => generateXml(node)).join('\n\n');

    // Generate markdown file list
    const markdownFileList = `\`\`\`files.txt\n[LAST MODIFIED DATE] ./FILE PATH\n[==============================================================]\n${filePaths.join('\n')}\n\`\`\``;

    // Generate ASCII file tree
    const asciiFileTree = generateAsciiTree(cleanedFileTree);
    const markdownFileTree = `\`\`\`filetree.txt\n${asciiFileTree}\n\`\`\``;

    return {
        content: `${content}\n\n${markdownFileList}\n\n${markdownFileTree}`,
        fileCount: cleanedFileTree.reduce((acc, node) => acc + countFiles(node), 0),
        filePaths,
    };
};
