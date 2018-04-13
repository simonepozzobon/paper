const mix = require('laravel-mix');
const glob = require('glob');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */

mix
    .js('src/js/app.js', 'dist/js')
    .extract(['jquery', 'tether', 'bootstrap'])
    .autoload({
        jquery: ['$', 'jQuery', 'jquery'],
        tether: ['Tether'],
    })
    .copy('src/index.html', 'dist')
    // .copyDirectory('src/fonts', 'dist/fonts')
    .copyDirectory('src/images/ready', 'dist/images')
    .copyDirectory('src/samples', 'dist/samples')
    .sass('src/sass/app.scss', 'dist/css')
    // .combine(['dist/js/manifest.js', 'dist/js/vendor.js', 'dist/js/app.js'], 'dist/js/osr.js')
    // .minify('dist/js/osr.js')
    // .minify('dist/css/app.css')
    .setPublicPath('dist')
    .browserSync({
        proxy: 'http://paper.test',
        browser: 'google chrome',
        notify: false,
        files: 'dist/**/*'
    })
    .webpackConfig({
        resolve: {
            alias: {
                'images' : path.resolve(__dirname, 'src/images/ready'),
                'styles' : path.resolve(__dirname, 'src/sass'),
                'scripts': path.resolve(__dirname, 'src/js'),
                'commons': path.resolve(__dirname, 'src/js/components/commons'),
                'npm': path.resolve(__dirname, 'node_modules'),
            }
        },
    })
    .options({
        // extractVueStyles: true,
        // purifyCss: true
    });


// Full API
// mix.js(src, output);
// mix.react(src, output); <-- Identical to mix.js(), but registers React Babel compilation.
// mix.ts(src, output); <-- Requires tsconfig.json to exist in the same folder as webpack.mix.js
// mix.extract(vendorLibs);
// mix.sass(src, output);
// mix.standaloneSass('src', output); <-- Faster, but isolated from Webpack.
// mix.fastSass('src', output); <-- Alias for mix.standaloneSass().
// mix.less(src, output);
// mix.stylus(src, output);
// mix.postCss(src, output, [require('postcss-some-plugin')()]);
// mix.browserSync('my-site.dev');
// mix.combine(files, destination);
// mix.babel(files, destination); <-- Identical to mix.combine(), but also includes Babel compilation.
// mix.copy(from, to);
// mix.copyDirectory(fromDir, toDir);
// mix.minify(file);
// mix.sourceMaps(); // Enable sourcemaps
// mix.version(); // Enable versioning.
// mix.disableNotifications();
// mix.setPublicPath('path/to/public');
// mix.setResourceRoot('prefix/for/resource/locators');
// mix.autoload({}); <-- Will be passed to Webpack's ProvidePlugin.
// mix.webpackConfig({}); <-- Override webpack.config.js, without editing the file directly.
// mix.babelConfig({}); <-- Merge extra Babel configuration (plugins, etc.) with Mix's default.
// mix.then(function () {}) <-- Will be triggered each time Webpack finishes building.
// mix.options({
//   extractVueStyles: false, // Extract .vue component styling to file, rather than inline.
//   globalVueStyles: file, // Variables file to be imported in every component.
//   processCssUrls: true, // Process/optimize relative stylesheet url()'s. Set to false, if you don't want them touched.
//   purifyCss: false, // Remove unused CSS selectors.
//   uglify: {}, // Uglify-specific options. https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
//   postCss: [] // Post-CSS options: https://github.com/postcss/postcss/blob/master/docs/plugins.md
// });
