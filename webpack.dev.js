const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = {
    mode: "development",
    devtool: "source-map",
    devServer: {
        compress: true,
        port: 8080,
    },
    entry: {
        "app": path.resolve(__dirname, "src", "main.js"),
        "worker": path.resolve(__dirname, "src", "worker.js")
    },
    output: {
      path: path.resolve(__dirname, "dist"), // string (default)
      filename: "[name].js",
      publicPath: "/", // string
      library: { // There is also an old syntax for this available (click to show)
        type: "umd", // universal module definition
        name: "app",
      },
    },
    plugins: [
        new HtmlWebpackPlugin({
          title: 'InstaSEPA',
          chunks: ['app'],
        }),
        new FaviconsWebpackPlugin("src/assets/icon.png"),
      ],
    module:{
        rules: [
          { test: /\.handlebars$/, loader: "handlebars-loader", options: {runtime: path.resolve(__dirname, 'handlebars')} },
          { test: /\.css$/, use: ["style-loader", "css-loader"], },
          {  test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            include: path.resolve(__dirname, './node_modules/bootstrap-icons/font/fonts'),
            use: {
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'webfonts',
                    publicPath: './webfonts',
                },
            }
          },
        ]
      }
  };
