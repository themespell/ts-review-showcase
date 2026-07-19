import { exec } from 'child_process';

function runCommand(command, label) {
    return new Promise((resolve, reject) => {
        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error in ${label}:`, error.message);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Stderr in ${label}:`, stderr);
            }
            resolve(stdout);
        });

        child.stdout.on('data', (data) => console.log(`[${label}]`, data.trim()));
        child.stderr.on('data', (data) => console.error(`[${label}]`, data.trim()));
    });
}

async function watchBuilds() {
    console.log('Starting watch mode for admin and frontend (minified and unminified)...');

    try {
        runCommand('vite build --config vite.config.admin.js --watch', 'Admin Min');
        runCommand('vite build --config vite.config.admin.js --watch --mode development-unminified', 'Admin Unmin');
        runCommand('vite build --config vite.config.frontend.js --watch', 'Frontend Min');
        runCommand('vite build --config vite.config.frontend.js --watch --mode development-unminified', 'Frontend Unmin');
    } catch (error) {
        console.error('Failed to start watch mode:', error);
    }
}

watchBuilds();
