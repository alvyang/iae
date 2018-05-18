var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: path.resolve(__dirname, './js/index.js'),
    output: {
        path: path.resolve(__dirname, './build'),
        publicPath:'./build/',
        filename: './index.js'
    },
    plugins:[
     new webpack.ProvidePlugin({
       $:"jquery",
       jQuery:"jquery",
       "window.jQuery":"jquery"
     })
    ],
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        presets: ["es2015"]
                    }
                }]
            },{
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            // modules: true // 设置css模块化,详情参考https://github.com/css-modules/css-modules
                        }
                    },
                    {
                        loader: "css-loader",
                        options: {
                            // modules: true // 设置css模块化,详情参考https://github.com/css-modules/css-modules
                        }
                    },
                ]
            },{
                test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'file-loader'
            },{
    	      		test: /\.(png|jpg)$/,loader: 'url-loader?limit=10000'
    	      }
        ]
    },
    resolve: {
	  alias: {
	    'vue$': 'vue/dist/vue.common.js'
	  }
	}
}
