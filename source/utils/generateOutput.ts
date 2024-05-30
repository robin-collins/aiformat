import fs from 'fs';

// Define version number
export const generateOutputVERSION = "0.0.4"; // Incremented version number

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
 * Generates XML and a list of file paths from the file tree.
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
            filePaths.push(`./${currentPath}`);
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
    const markdownFileList = `\`\`\`files.txt\n${filePaths.join('\n')}\n\`\`\``;

    return {
        content: `${content}\n\n${markdownFileList}`,
        fileCount: cleanedFileTree.reduce((acc, node) => acc + countFiles(node), 0),
        filePaths,
    };
};
