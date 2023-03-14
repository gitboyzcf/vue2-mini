import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";

export default {
  input: "./src/index.js", // 入口
  output: {
    file: "./dist/vue.js", // 出口
    name: "Vue", // global.Vue
    format: "esm", // 以什么模块化规范进行打包
    sourcemap: true, // 可以调试源代码
  },
  plugins: [
    babel({
      exclude: "node_modules/**", // 忽略此文件夹下的所用文件
    }),
    serve({
      open: true,
      host: "localhost",
      port: 10001, // 端口10001
      contentBase: "", // '' 当前目录
      openPage: "/index.html", // 打开指定的html
    }),
  ],
};
