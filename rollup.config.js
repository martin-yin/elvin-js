import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import typescript2 from "rollup-plugin-typescript2";
import { uglify } from "rollup-plugin-uglify";
import filesize from "rollup-plugin-filesize";
import progress from "rollup-plugin-progress";
const getPath = (_path) => path.resolve(__dirname, _path);
import packageJSON from "./package.json";
import { minify } from "uglify-js";
import resolve from "@rollup/plugin-node-resolve";

// ts
const tsPlugin = typescript2({
  tsconfig: getPath("./tsconfig.json"), // 导入本地ts配置
});

// 基础配置
const commonConf = {
  input: getPath("./packages/index.ts"),
  plugins: [
    resolve(),
    tsPlugin,
    commonjs({
      exclude: 'node_modules'
    }),
    uglify({}, minify),
    progress(),
    filesize({
      showGzippedSize: false,
    }),
  ],
};
// 需要导出的模块类型
const outputMap = [
  {
    file: packageJSON.main, // 通用模块
    format: "umd",
    name: packageJSON.name,
  },
  {
    file: packageJSON.module, // es 模块
    format: "es",
    name: packageJSON.name,
  },
];

const buildConf = (options) => Object.assign({}, commonConf, options);

export default outputMap.map((output) =>
  buildConf({ output: { name: packageJSON.name, ...output } })
);
