module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy({});
    eleventyConfig.addPassthroughCopy("styles");
    eleventyConfig.addPassthroughCopy("images");    
    eleventyConfig.addPassthroughCopy("cheeky.htm");

    return {
        dir: {
            input: ".",
            includes: "_includes",
            output: "_site"
        }
    };
};