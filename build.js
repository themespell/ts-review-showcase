import { execSync } from 'child_process';

try {
    console.log('Building admin...');
    execSync('vite build --config vite.config.admin.js', { stdio: 'inherit' });

    console.log('Building frontend...');
    execSync('vite build --config vite.config.frontend.js', { stdio: 'inherit' });

    console.log('Build completed successfully.');
} catch (error) {
    console.error('Build failed:', error);
}
