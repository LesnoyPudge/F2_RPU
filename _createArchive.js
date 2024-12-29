import fs from 'fs';
import path from 'path';
import archiver from 'archiver';



// Exclude these directories
const excludeDirs = [
    '.git',
    '.gitignore',
    'node_modules',
    'package.json',
    '_createArchive.js',
    '_extractArchive.js',
    'archive.zip',
]; 

// Function to get all files in a directory recursively, excluding certain directories/files
const getFilesToArchive = (dir) => {
    const result = [];

    // Read all files and directories in the current directory
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        // Check if the item should be excluded
        if (excludeDirs.some(exclude => fullPath.includes(exclude))) {
            return;
        }

        // If it's a directory, recurse into it
        if (stats.isDirectory()) {
            result.push(...getFilesToArchive(fullPath));  // Recursively add files in subdirectory
        } else {
            // If it's a file, add it to the result
            result.push(fullPath);
        }
    });

    return result;
};

// Dynamically populate the list of files to archive
const filesToArchive = getFilesToArchive(path.resolve('.'));

console.log('Files count to be archived:', filesToArchive.length);

if (fs.existsSync('archive.zip')) {
    fs.unlinkSync('archive.zip');
}

// Output zip file path
const zipFilePath = path.resolve('archive.zip');

// Create a writable stream for the zip file
const output = fs.createWriteStream(zipFilePath);

// Create an archiver instance for zip compression
const archive = archiver('zip', {
    zlib: { level: 9 }, // Maximum compression
});

// Handle errors during archiving
archive.on('error', (err) => {
    throw err;
});

// Pipe the archive to the output zip file
archive.pipe(output);

// Function to add files to the archive while preserving the directory structure
const addFilesToArchive = (file) => {
    // Get the relative file path from the root project folder
    const relativePath = path.relative(path.resolve('.'), file);

    // Add the file to the archive, using the full relative path
    archive.append(fs.createReadStream(file), { name: relativePath });
};

// Add files to the archive
filesToArchive.forEach(addFilesToArchive);

// Finalize the archive (close the zip file)
await new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.finalize();
});

console.log(`Archive created successfully: ${zipFilePath}`);