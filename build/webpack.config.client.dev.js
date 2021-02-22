var path = require('path');
var express = require('express');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CircularDependencyPlugin = require('circular-dependency-plugin');
var ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

var config = require('./../config');

var BASE_PATH = process.env.BASE_PATH || '/';

module.exports = {
    name: 'client',
    devtool: 'source-map',
    target: 'web',
    mode: 'development',
    entry: {
        app: [path.join(config.editorDir, 'index.js')]
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        path: config.distDir,
        publicPath: BASE_PATH
    },
    resolve: {
        modules: [
            'node_modules',
            config.srcDir,
            config.editorDir
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CircularDependencyPlugin({
            exclude: /a\.js|node_modules/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd(),
        }),
        new HtmlWebpackPlugin({
            template: config.srcHtmlLayout,
            inject: false,
            chunksSortMode: 'none'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.BASE_PATH': JSON.stringify(BASE_PATH),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractCssChunks(),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            // Modular Styles
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                        }
                    },
                    { loader: 'postcss-loader' }
                ],
                exclude: [path.resolve(config.srcDir, 'styles'), path.resolve(config.editorDir, 'styles')],
                include: [config.srcDir, config.editorDir]
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                        }
                    },
                    { loader: 'postcss-loader' },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: config.scssIncludes
                        }
                    }
                ],
                exclude: [path.resolve(config.srcDir, 'styles'), path.resolve(config.editorDir, 'styles')],
                include: [config.srcDir, config.editorDir]
            },
            // Global Styles
            {
                test: /\.css$/,
                use: [
                    ExtractCssChunks.loader,
                    'css-loader',
                    'postcss-loader'
                ],
                include: [path.resolve(config.srcDir, 'styles'), path.resolve(config.editorDir, 'styles')]
            },
            {
                test: /\.scss$/,
                use: [
                    ExtractCssChunks.loader,
                    'css-loader',
                    'postcss-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: config.scssIncludes
                        }
                    }
                ],
                include: [path.resolve(config.srcDir, 'styles'), path.resolve(config.editorDir, 'styles')],
            },
            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                loader: "file-loader",
                options: {
                    name: "fonts/[name].[ext]",
                }
            },
            // Files
            {
                test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
                loader: "file-loader",
                options: {
                    name: "static/[name].[ext]",
                }
            }
        ]
    },
    devServer: {
        hot: true,
        contentBase: config.serveDir,
        compress: true,
        historyApiFallback: {
            index: BASE_PATH
        },
        before(app) {
            app.use('/assets',
                express.static(path.join(__dirname, '/../djseteditor/assets')));
        },
        host: '0.0.0.0',
        port: 4100
    }
}