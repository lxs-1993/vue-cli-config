const { defineConfig } = require('@vue/cli-service')
 // PurgecssPlugin去除无用的css
const PurgecssPlugin = require('purgecss-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin"); // 版本是 5.0.1 开启gzip压缩， 按需引用
//gzip压缩插件
const glob = require('glob-all');
const path = require('path');
const prod = process.env.NODE_ENV === 'production' // 判断是否是生产环境
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let cdn = {
  dev: {
    css:[],js:[]
  },
  build: {
    css: [],
    js: [
      // vue must at first!
      'https://cdn.bootcss.com/vue/2.6.10/vue.min.js', // vuejs
      'https://cdn.bootcss.com/vue-router/3.0.7/vue-router.min.js', // vue-router js
      'https://cdn.bootcss.com/vuex/3.1.1/vuex.min.js', // vuex js
    ]
  }
}

module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true,
  productionSourceMap: !prod, // 
  // productionGzip: true,
  configureWebpack: {
    // PurgecssPlugin去除无用的css
    plugins: [
      new PurgecssPlugin({
        paths: glob.sync([
          path.join(__dirname, './src/index.html'),
          path.join(__dirname, './**/*.vue'),
          path.join(__dirname, './src/**/*.js')
        ])
      }),
      new BundleAnalyzerPlugin(
        {
          analyzerMode: 'static',//可选值有server static disabled
          generateStatsFile: false,
          statsOptions: { source: false },
          openAnalyzer: false
        }
      )
    ]
  },
  chainWebpack: config => {
    // css合并
    // config.plugin('extract-css').tap(args => [{
    //   filename: 'css/[name].[contenthash:6].css',
    //   chunkFilename: 'css/[name].[contenthash:6].css'
    // }]);
    // css压缩
    config.optimization
      .minimizer('css')
      .tap(args => [...args, { cssProcessorOptions: { safe: false } }])
    // js压缩插件 相当于webpack中的terser-webpack-plugin
    config.optimization.minimize(true)
      .minimizer('terser')
      .tap(args => {
        let { terserOptions } = args[0];
        // 去除console
        terserOptions.compress.drop_console = true;
        terserOptions.compress.drop_debugger = true;
        return args
      });
      // js gzip压缩
      // config.plugin("compression").use(CompressionPlugin, [
      //   {
      //     test: /\.(js|css)?$/i, // 哪些文件要压缩
      //     filename: "[path].gz[query]", // 压缩后的文件名
      //     algorithm: "gzip", // 使用gzip压缩
      //     minRatio: 0.8, // 压缩率小于0.8才会压缩
      //     deleteOriginalAssets: false, // 删除未压缩的文件，谨慎设置，如果希望提供非gzip的资源，可不设置或者设置为false
      //   },
      // ]);
        // 排除npm包
      config.externals({
        "vue": "Vue",
        "vue-router": "VueRouter",
        "vuex": "Vuex",
      });
      // 注入cdn变量 (打包时会执行)
      config.plugin('html').tap(args => {
        args[0].cdn = prod ? cdn.build : cdn.dev // 配置cdn给插件
        return args
      })
  }
})
