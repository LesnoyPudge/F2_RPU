import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

// Path to the zip file
const zipFilePath = path.resolve('archive.zip');
const unzipPath = path.resolve('./EXTRACTED');

// Check if the zip file exists
if (!fs.existsSync(zipFilePath)) {
    console.error(`Zip file not found: ${zipFilePath}`);
    process.exit(1);
}

if (fs.existsSync(unzipPath)) {
    fs.rmSync(unzipPath, {force: true, recursive: true});
}

fs.mkdirSync(unzipPath)


// Extract files from the zip archive
try {
    console.log(zipFilePath)
    const directory = await unzipper.Open.file(zipFilePath);
    console.log(directory.files.length)
    await directory.extract({ path: unzipPath })

    console.log(`Archive extracted successfully to ${unzipPath}`);
} catch (err) {
    console.error('Error extracting archive:', err);
}
