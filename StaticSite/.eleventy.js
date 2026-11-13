module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("styles");
    eleventyConfig.addPassthroughCopy("images"); 
    eleventyConfig.addPassthroughCopy("fonts");
    eleventyConfig.addPassthroughCopy("interests/**/*.jpg");    
    eleventyConfig.addPassthroughCopy("cheeky.htm");
    eleventyConfig.addPassthroughCopy("CNAME");

    // Third-party code is served from this site, not a CDN. It's installed with npm
    // (pinned in package.json) and copied into /vendor/ at build time.
    eleventyConfig.addPassthroughCopy({
        "node_modules/photoswipe/dist/photoswipe.css": "vendor/photoswipe/photoswipe.css",
        "node_modules/photoswipe/dist/photoswipe-lightbox.esm.min.js": "vendor/photoswipe/photoswipe-lightbox.esm.min.js",
        "node_modules/photoswipe/dist/photoswipe.esm.min.js": "vendor/photoswipe/photoswipe.esm.min.js",
        "node_modules/photoswipe/LICENSE": "vendor/photoswipe/LICENSE.txt"
    });

    return {
        dir: {
            input: ".",
            includes: "_includes",
            output: "_site"
        }
    };
};