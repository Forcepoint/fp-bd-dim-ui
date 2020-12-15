module.exports = {
    chainWebpack: config =>  {
        config.plugins.delete('optimize-css')
    }
}
