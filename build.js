const {rollup} = require('rollup');

let cache;

async function buildWithCache(config, useCache) {
    const bundle = await rollup({
        cache: useCache ? cache : false, // is ignored if falsy
        ...config
    });
    cache = bundle.cache; // store the cache object of the previous build
    return bundle;
}

const cjsBuild = {
    inputOptions: {
        input: 'src/index.js',
        external: ['./lib/utils']
    },

    outputOptions: {
        format: 'cjs',
        name: 'Test',
        dir: './dist',
        entryFileNames: 'test.cjs.js'
    }
}
const umdBuild = {
    inputOptions: {
        input: 'src/index.js',
        external: [],
    },

    outputOptions: {
        format: 'umd',
        name: 'Test',
        dir: './dist',
        entryFileNames: 'test.umd.js'
    }
}

// Make a CJS build that will cache bundles
buildWithCache(cjsBuild.inputOptions, true)
    .then(bundle => {
        return bundle.write(cjsBuild.outputOptions)
    })
    // Now make a UMD build, using the cache from previous build
    // Note that `umdBuild.inputOptions` specifies `external: []`, so every modules should be inlined into the
    // resulting bundle, but won't because of the cache.
    .then(() => buildWithCache(umdBuild.inputOptions, true)) // will use the cache of the previous build
    .then(bundle => {
        return bundle.write(umdBuild.outputOptions)
    })
    // Make another UMD build, this time without the cache: imported modules are correctly inlined into the bundle
    .then(() => buildWithCache(umdBuild.inputOptions, false)) // will use the cache of the previous build
    .then(bundle => {
        return bundle.write({ ...umdBuild.outputOptions, entryFileNames: 'correct.umd.js' })
    })
