const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new FaviconsWebpackPlugin('./src/images/zouwu.png')
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), // Каталог для статики
        },
        open: true, // Автоматически открывать браузер
    },
    mode: 'development', // Режим сборки,
    module: {
        rules: [
            {
                test: /\.css$/, // Регулярное выражение для обработки файлов с расширением .css
                use: ['style-loader', 'css-loader'], // Загрузчики, используемые для обработки CSS-файлов
            },
            {
                test: /\.png/,
                type: 'asset/resource'
            },
            {
                test: /\.wav/,
                loader: "file-loader"
            }
        ],
    },
};
