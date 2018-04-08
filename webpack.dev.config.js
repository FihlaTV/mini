"use strict";

const webpack = require("webpack");
const path = require("path");
const autoprefixer = require("autoprefixer");

const CircularDependencyPlugin = require("circular-dependency-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackAlterAssetPlugin = require("html-webpack-alter-asset-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");

module.exports = {

	devtool: "cheap-module-source-map",

	resolve: {
		extensions: [".ts", ".js", ".scss"]
	},

	externals: {
		three: "THREE",
		Ammo: "Ammo"
	},

	entry: {
		main: "./src/static/ts/main.ts"
	},

	output: {
		pathinfo: true,
		path: path.resolve(process.cwd(), "deploy"),
		filename: "static/js/[name].bundle.js",
		chunkFilename: "static/js/[id].chunk.js"
	},

	module: {
		rules: [{
			test: /\.js$/,
			enforce: "pre",
			loader: "source-map-loader",
			exclude: /node_modules/
		}, {
			enforce: "pre",
			test: /\.ts$/,
			exclude: /\$\$_gendir/,
			loader: "tslint-loader"
		}, {
			enforce: "pre",
			test: /\.html$/,
			exclude: /node_modules/,
			loader: "htmlhint-loader"
		}, {
			test: /\.ts$/,
			loader: "ts-loader"
		}, {
			test: /\.scss$/,
			loader: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: [{
					loader: "css-loader",
					options: {
						sourceMap: true,
						importLoaders: 1
					}
				}, {
					loader: "postcss-loader",
					options: {
						sourceMap: true,
						ident: "postcss",
						plugins: () => {
							return [
								autoprefixer()
							];
						}
					}
				}, {
					loader: "sass-loader",
					options: {
						sourceMap: true,
						precision: 8
					}
				}]
			})
		}, {
			test: /\.(eot|otf|ttf|woff|woff2)$/,
			loader: "file-loader?publicPath=/&outputPath=static/fonts/&name=[name].[ext]"
		}, {
			test: /\.(jpg|png|gif|svg|ico)$/,
			loader: "file-loader?publicPath=/&outputPath=static/gfx/&name=[name].[ext]"
		}, {
			test: /\.js$/,
			include: path.resolve(process.cwd(), "src/static/js"),
			loader: "file-loader?publicPath=/&outputPath=static/js/&name=[name].[ext]"
		}, {
			test: /\.json$/,
			include: path.resolve(process.cwd(), "src/static/models"),
			loader: "file-loader?publicPath=/&outputPath=static/models/&name=[name].[ext]"
		}, {
			test: /\.html$/,
			loader: "raw-loader"
		}]
	},

	plugins: [
		new HardSourceWebpackPlugin({
			cacheDirectory: "../node_modules/.cache/hard-source/[confighash]",
			environmentHash: {
				root: process.cwd(),
				directories: [],
				files: ["package-lock.json", "yarn.lock", "webpack.dev.config.js"],
			},
		}),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.ProgressPlugin(),
		new webpack.DefinePlugin({
			"process.env": {
				"PRODUCTION": JSON.stringify(false)
			}
		}),
		new webpack.EnvironmentPlugin({
			"NODE_ENV": "development"
		}),
		new CleanWebpackPlugin(["deploy"], {
			verbose: true
		}),
		new CopyWebpackPlugin([
			{from: "src/robots.txt", to: "."},
			{from: "src/sitemap.xml", to: "."},
			{from: "src/static/js/*.*", to: "./static/js/", flatten: true},
			{from: "node_modules/three/build/three.min.js", to: "./static/js/", flatten: true}
		]),
		new StyleLintPlugin({
			syntax: "scss"
		}),
		new CircularDependencyPlugin({
			exclude: /node_modules/,
			failOnError: false
		}),
		new HtmlWebpackPlugin({
			template: "src/index.ejs",
			filename: "index.html",
			hash: false,
			inject: true,
			compile: true,
			cache: true,
			showErrors: true,
			minify: false,
			chunksSortMode: "manual",
			chunks: [
				"main"
			]
		}),
		new ExtractTextPlugin({
			filename: "static/css/[name].css"
		}),
		new ScriptExtHtmlWebpackPlugin({
			defaultAttribute: "defer"
		}),
		new HtmlWebpackAlterAssetPlugin()
	],

	node: {
		fs: "empty",
		global: true,
		crypto: "empty",
		tls: "empty",
		net: "empty",
		process: true,
		module: false,
		clearImmediate: false,
		setImmediate: false
	},

	performance: {
		hints: false,
	},

	watchOptions: {
		aggregateTimeout: 300,
		poll: 1000,
		ignored: /node_modules|deploy/
	},

	devServer: {
		port: 8080,
		host: "0.0.0.0",
		historyApiFallback: true,
		disableHostCheck: true
	}
};
