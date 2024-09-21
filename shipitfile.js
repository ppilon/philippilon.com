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

    shipit.task('start_nginx', async () => {
        await shipit.remote('sudo systemctl restart nginx');
    });
};
