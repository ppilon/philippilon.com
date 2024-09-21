const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './app/js/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,  // Cleans the 'dist' folder before each build
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader',
				],
			},
			{
				test: /\.(png|jpg|jpeg|gif|svg)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'images/[name][ext]',  // Specify output folder for images
				},
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'fonts/[name][ext]',  // Specify output folder for fonts
				},
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './app/index.html.ejs',
			filename: 'index.html',
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'app/images', to: 'images' },  // Copy images from 'app/images' to 'dist/images'
			],
		}),
	],
};
