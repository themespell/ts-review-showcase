#!/usr/bin/env node

/**
 * TS Review Showcase - Distribution Build Script
 *
 * Creates a distributable ZIP file following .distignore rules
 * Output:
 *   - dist/ts-review-showcase.{version}.zip
 *
 * Usage: npm run dist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import ignore from 'ignore';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PLUGIN_SLUG = 'ts-review-showcase';
const PLUGIN_NAME = 'TS Review Showcase';
const SOURCE_DIR = __dirname;
const DIST_DIR = path.join(SOURCE_DIR, 'dist');
const DISTIGNORE_FILE = path.join(SOURCE_DIR, '.distignore');
const MAIN_PLUGIN_FILE = path.join(SOURCE_DIR, 'ts-review-showcase.php');

/**
 * Read plugin metadata from main plugin file
 */
function getPluginMetadata() {
    const metadata = {
        version: '1.0.0',
        requires: '5.0',
        tested: '6.9',
        requires_php: '7.4',
        description: 'Product Reviews, Review Showcase, Review Slider Plugin for WordPress'
    };

    try {
        const content = fs.readFileSync(MAIN_PLUGIN_FILE, 'utf8');

        // Try to get version from TSREVIEW_VERSION constant
        const versionMatch = content.match(/define\s*\(\s*['"]TSREVIEW_VERSION['"]\s*,\s*['"]([0-9.]+)['"]\s*\)/);
        if (versionMatch && versionMatch[1]) {
            metadata.version = versionMatch[1];
        }

        // Try to match from comment block
        if (metadata.version === '1.0.0') {
            const versionMatch = content.match(/\*\s*Version:\s*([0-9.]+)/i);
            if (versionMatch && versionMatch[1]) {
                metadata.version = versionMatch[1];
            }
        }

        const requiresMatch = content.match(/\*\s*Requires at least:\s*([0-9.]+)/i);
        if (requiresMatch && requiresMatch[1]) {
            metadata.requires = requiresMatch[1];
        }

        const testedMatch = content.match(/\*\s*Tested up to:\s*([0-9.]+)/i);
        if (testedMatch && testedMatch[1]) {
            metadata.tested = testedMatch[1];
        }

        const phpMatch = content.match(/\*\s*Requires PHP:\s*([0-9.]+)/i);
        if (phpMatch && phpMatch[1]) {
            metadata.requires_php = phpMatch[1];
        }

        const descMatch = content.match(/\*\s*Description:\s*(.+)/i);
        if (descMatch && descMatch[1]) {
            metadata.description = descMatch[1].trim();
        }
    } catch (err) {
        console.warn('Could not read metadata from plugin file:', err.message);
    }

    return metadata;
}

const PLUGIN_METADATA = getPluginMetadata();
const PLUGIN_VERSION = PLUGIN_METADATA.version;
const OUTPUT_ZIP = path.join(DIST_DIR, `${PLUGIN_SLUG}.${PLUGIN_VERSION}.zip`);

/**
 * Parse .distignore file and return ignore instance
 */
function loadDistIgnore() {
    const ig = ignore();

    // Always ignore these
    ig.add([
        '.git',
        '.DS_Store',
        'dist',
        'build-dist.js',
        '.claude',
        '.idea',
        'node_modules',
        'eslint.config.js',
        'package-lock.json',
        'yarn.lock',
        '.gitignore',
        '.gitattributes',
        'psalm.xml',
        'vendor',
        'composer.lock',
        'composer.phar',
    ]);

    if (fs.existsSync(DISTIGNORE_FILE)) {
        const content = fs.readFileSync(DISTIGNORE_FILE, 'utf8');
        const lines = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));

        ig.add(lines);
        console.log(`Loaded ${lines.length} rules from .distignore`);
    } else {
        console.log('No .distignore found, using defaults');
    }

    return ig;
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, ig, arrayOfFiles = [], relativeTo = SOURCE_DIR) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const relativePath = path.relative(relativeTo, fullPath);
        const normalizedPath = relativePath.split(path.sep).join('/');
        const isDir = fs.statSync(fullPath).isDirectory();
        const testPath = isDir ? `${normalizedPath}/` : normalizedPath;
        const testResult = ig.test(testPath);

        if (isDir) {
            if (testResult.ignored && !testResult.unignored) {
                return;
            }
            getAllFiles(fullPath, ig, arrayOfFiles, relativeTo);
        } else {
            if (!testResult.ignored || testResult.unignored) {
                arrayOfFiles.push(relativePath);
            }
        }
    });

    return arrayOfFiles;
}

/**
 * Main build function
 */
async function build() {
    console.log('');
    console.log('========================================');
    console.log(`  Building ${PLUGIN_SLUG} v${PLUGIN_VERSION}`);
    console.log('========================================');
    console.log('');

    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
        console.log('Created dist/ directory');
    }

    if (fs.existsSync(DIST_DIR)) {
        const existingFiles = fs.readdirSync(DIST_DIR);
        existingFiles.forEach(file => {
            if (file.endsWith('.zip')) {
                fs.unlinkSync(path.join(DIST_DIR, file));
                console.log(`Removed old ZIP: ${file}`);
            }
        });
    }

    const ig = loadDistIgnore();

    const filesToInclude = getAllFiles(SOURCE_DIR, ig);
    console.log(`Found ${filesToInclude.length} files after filtering`);
    console.log('');

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(OUTPUT_ZIP);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);

            console.log('');
            console.log('========================================');
            console.log('  Build Complete!');
            console.log('========================================');
            console.log('');
            console.log('  Generated Files:');
            console.log(`    - dist/${PLUGIN_SLUG}.${PLUGIN_VERSION}.zip (${sizeMB} MB)`);
            console.log('');
            console.log('  Plugin Info:');
            console.log(`    - Name: ${PLUGIN_NAME}`);
            console.log(`    - Version: ${PLUGIN_VERSION}`);
            console.log(`    - Files: ${filesToInclude.length}`);
            console.log(`    - Folder in ZIP: ${PLUGIN_SLUG}/`);
            console.log('');
            console.log('========================================');
            console.log('');

            resolve();
        });

        archive.on('warning', err => {
            if (err.code === 'ENOENT') {
                console.warn('Warning:', err.message);
            } else {
                reject(err);
            }
        });

        archive.on('error', err => {
            reject(err);
        });

        archive.pipe(output);

        const totalFiles = filesToInclude.length;
        let processedFiles = 0;
        let lastLoggedPercent = -1;

        console.log('Adding files to archive...\n');

        filesToInclude.forEach(file => {
            const sourcePath = path.join(SOURCE_DIR, file);
            const archivePath = `${PLUGIN_SLUG}/${file}`;

            archive.file(sourcePath, { name: archivePath });

            processedFiles++;
            const percent = Math.floor((processedFiles / totalFiles) * 100);

            if (percent !== lastLoggedPercent && percent % 5 === 0) {
                process.stdout.write(`\r  Progress: ${percent}% (${processedFiles}/${totalFiles} files)`);
                lastLoggedPercent = percent;
            }
        });

        process.stdout.write(`\r  Progress: 100% (${totalFiles}/${totalFiles} files)\n`);
        console.log('\nFinalizing archive...');

        archive.finalize();
    });
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
