const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
 
module.exports = {
    mode: "production",
    entry: {
        "app": path.resolve(__dirname, "src", "main.js"),
        "worker": path.resolve(__dirname, "src", "worker.js")
        },
    output: {
      path: path.resolve(__dirname, "prod"), // string (default)
      filename: "[name].js",
      publicPath: "./", // string
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
        new WebpackPwaManifest({
            name: 'InstaSEPA',
            short_name: 'InstaSEPA',
            description: 'Save and generate SEPA payment forms',
            background_color: '#ffffff',
            crossorigin: null, //can be null, use-credentials or anonymous
            icons: [
              {
                src: path.resolve('src/assets/icon.png'),
                sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
              }
            ]
        })
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
