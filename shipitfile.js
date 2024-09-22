require('dotenv').config();  // Load environment variables from .env

module.exports = function (shipit) {
    require('shipit-deploy')(shipit);

    shipit.initConfig({
        default: {
            repositoryUrl: process.env.REPOSITORY_URL,  // Same repository for all servers
            key: process.env.PRODUCTION_KEY,  // Same SSH key for all servers
            deployTo: process.env.DEPLOY_PATH,  // Same deployment path for all servers
            ignores: ['.git', 'node_modules'],
            keepReleases: 5,
            deleteOnRollback: false,
            shallowClone: true,
        },
        production: {
            servers: process.env.PRODUCTION_SERVERS.split(','),  // Split comma-separated servers into an array
        }
    });

    // Task to build the project
    shipit.task('build', async () => {
        shipit.log('Building project for production...');
        await shipit.local('npm install');  // Install dependencies
        await shipit.local('npm run build');  // Run the build process
    });

    // Task to upload assets to S3 after building
    shipit.task('upload_to_s3', async () => {
        shipit.log('Uploading assets to S3...');
        await shipit.local('node ./S3UploadPlugin.js');  // Run the custom S3 upload script
    });

    // Task to restart Nginx on the remote server after deployment
    shipit.task('start_nginx', async () => {
        await shipit.remote('sudo systemctl restart nginx');
    });

    // Build the project, upload assets to S3, and then deploy
    shipit.on('fetched', async () => {
        await shipit.start('build');  // First build the project
        await shipit.start('upload_to_s3');  // Then upload assets to S3
    });

    // After deployment, restart Nginx
    shipit.on('deployed', async () => {
        await shipit.start('start_nginx');
    });
};
