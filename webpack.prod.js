const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');  // Import the common config
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const S3UploadPlugin = require('./S3UploadPlugin');  // Custom S3 Plugin (optional)
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Get the latest commit hash for cache-busting purposes
const commitHash = require('child_process').execSync('git rev-parse --short HEAD').toString().trim();

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: `https://assets.philippilon.com/assets/${commitHash}/`,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    splitChunks: { chunks: 'all' },
    runtimeChunk: 'single',
  },
  plugins: [
    new CleanWebpackPlugin(),  // Add this to ensure 'dist' is cleared before each build
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new S3UploadPlugin({
      basePath: `assets/${commitHash}`,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
});
