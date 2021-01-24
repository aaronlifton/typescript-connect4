const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  mode: "production",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.css$/i, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      {
        test: /\.(mp3|wav)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin ({
      title: 'Typescript Connect4',
      filename: 'assets/index.html'
    }),
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({ patterns: [ { from: 'src/assets', to: 'assets'} ] })
  ],
};
