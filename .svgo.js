module.exports = {
    plugins: [
        {
            name: "removeViewBox",
            active: false,
        },
        {
            name: "convertStyleToAttrs",
            active: true,
        },
        {
            name: "cleanupIDs",
            active: false,
        },
        {
            name: "removeUnknownsAndDefaults",
            active: false,
        },
        {
            name: "convertPathData",
            params: {
                noSpaceAfterFlags: false,
            },
        },
        {
            name: "mergePaths",
            params: {
                noSpaceAfterFlags: false,
            },
        },
    ],
};
