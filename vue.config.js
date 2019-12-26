const path = require('path');//引入path模块
function resolve(dir){
    return path.join(__dirname,dir)//path.join(__dirname)设置绝对路径
}
module.exports={
    chainWebpack:(config)=>{
        config.resolve.alias
        .set('@',resolve('./src'))
        .set('components',resolve('./src/components'))
        //set第一个参数：设置的别名，第二个参数：设置的路径
         // threeJS 内部插件
        config.module
        .rule('OrbitControls')
        .test(require.resolve('three/examples/js/controls/OrbitControls.js'))
        .use('exports-loader?THREE.OrbitControls')
            .loader('imports-loader?THREE=three')
            .end()
        config.module
            .rule('GLTFLoader')
            .test(require.resolve('three/examples/js/loaders/GLTFLoader.js'))
            .use('exports-loader')
            .loader('imports-loader?THREE=three')
            .end()
    },
    output:{
        publicPath:'./'
    }
    // devServer: {
    //     proxy: 'http://192.168.1.137:8080',//这会告诉开发服务器将任何未知请求 (没有匹配到静态文件的请求) 代理到http://localhost:4000
    //   }

}