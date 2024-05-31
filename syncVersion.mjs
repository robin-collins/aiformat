import fs from 'fs';
import path from 'path';

// Resolve the path to the App.tsx file.
const appFilePath = path.resolve('source', 'constants.ts');
// Resolve the path to the package.json file.
const packageJsonPath = path.resolve('package.json');

/**
 * Update the version in package.json.
 *
 * @param {string} newVersion - The new version to be set in package.json.
 */
const updatePackageJsonVersion = (newVersion) => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`Updated package.json version to ${newVersion}`);
};

/**
 * Get the AIFORMAT_VERSION from App.tsx.
 *
 * @returns {string} - The version from App.tsx.
 */
const getAppVersion = () => {
    const appFileContent = fs.readFileSync(appFilePath, 'utf8');
    const versionMatch = appFileContent.match(/export const AIFORMAT_VERSION = '(\d+\.\d+\.\d+)'/);
    if (versionMatch) {
        return versionMatch[1];
    } else {
        throw new Error("Could not find AIFORMAT_VERSION in App.tsx");
    }
};

/**
 * Main function to sync the version from App.tsx to package.json.
 */
const syncVersion = () => {
    try {
        const newAppVersion = getAppVersion();
        updatePackageJsonVersion(newAppVersion);
    } catch (error) {
        console.error(`Error syncing version: ${error.message}`);
        process.exit(1);
    }
};

// Run the main function.
syncVersion();
