const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

class S3UploadPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapPromise('S3UploadPlugin', async (compilation) => {
            const s3 = new S3Client({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY,
                    secretAccessKey: process.env.AWS_SECRET_KEY,
                },
            });

            const assets = Object.keys(compilation.assets);  // Get all asset filenames
            const uploadPromises = assets.map(async (asset) => {
                const filePath = path.join(compiler.outputPath, asset);  // Get full path to the file
                const fileContent = fs.readFileSync(filePath);  // Read file content

                const params = {
                    Bucket: process.env.AWS_BUCKET,
                    Key: `${this.options.basePath}/${asset}`,  // S3 key (file path)
                    Body: fileContent,
                };

                console.log(`Uploading ${asset} to S3...`);

                try {
                    await s3.send(new PutObjectCommand(params));
                    console.log(`Successfully uploaded ${asset}`);
                } catch (error) {
                    console.error(`Error uploading ${asset}:`, error);
                }
            });

            return Promise.all(uploadPromises);
        });
    }
}

module.exports = S3UploadPlugin;
