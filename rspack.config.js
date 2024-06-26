const { dependencies: deps, ...packageJson } = require("./package.json");
const rspack = require("@rspack/core");
const ReactRefreshPlugin = require("@rspack/plugin-react-refresh");
const path = require("node:path");

const port = 3000;
const isDevelopment = true;
const isProduction = !isDevelopment;

const buildDir = path.resolve(process.cwd(), "dist");

/** @type {import('@rspack/cli').Configuration} */
const config = {
  mode: "development",
  resolve: {
    extensions: [
      ".ts",
      ".tsx",
      ".mjs",
      ".cjs",
      ".js",
      ".jsx",
      ".json",
      ".wasm",
    ],
  },
  entry: "./src/index.ts",
  context: __dirname,
  watchOptions: {
    ignored: ["**/node_modules/**", "**/@mf-types/**"],
  },
  output: {
    uniqueName: packageJson.name,
    filename: (pathData) =>
      pathData.chunk.name === "main"
        ? "js/dist/bundle.js"
        : pathData.chunk.name,
    path: buildDir,
    publicPath: "auto",
  },
  devServer: {
    port,
    historyApiFallback: {
      index: "/index.html",
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
    static: {
      directory: path.join(__dirname, "dist"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(j|t)s$/,
        exclude: [/[\\/]node_modules[\\/]/],
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
            },
            externalHelpers: true,
            transform: {
              react: {
                runtime: "automatic",
                development: !isProduction,
                refresh: !isProduction,
              },
            },
          },
          env: {
            targets: "Chrome >= 48",
          },
        },
      },
      {
        test: /\.(j|t)sx$/,
        loader: "builtin:swc-loader",
        exclude: [/[\\/]node_modules[\\/]/],
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true,
            },
            transform: {
              react: {
                runtime: "automatic",
                development: !isProduction,
                refresh: !isProduction,
              },
            },
            externalHelpers: true,
          },
          env: {
            targets: "Chrome >= 48", // browser compatibility
          },
        },
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: "./public/index.html" }),
    isDevelopment && new ReactRefreshPlugin(),
  ].filter(Boolean),
  optimization: {
    minimize: isProduction,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin(),
    ],
  },
};

module.exports = config;
