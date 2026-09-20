module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy({});
    eleventyConfig.addPassthroughCopy("styles");
    eleventyConfig.addPassthroughCopy("images"); 
    eleventyConfig.addPassthroughCopy("interests/**/*.jpg");    
    eleventyConfig.addPassthroughCopy("cheeky.htm");
    eleventyConfig.addPassthroughCopy("CNAME");

    return {
        dir: {
            input: ".",
            includes: "_includes",
            output: "_site"
        }
    };
};