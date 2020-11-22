# rollup-cache-external-bug
A tiny Rollup project to show reproduction of a potential bug with Rollup caching mechanism

When using Rollup's cache mechanism to speed up consecutive builds, Rollup seems to reuse the external
"status" of any cached module, instead of reevaluating it against the current build's configuration.

As a result, a build that declares a lib as external will, if its cached bundle is used in the next build,
force the said lib to be considered external, even if the next build's configuration does not declare it as such.

More concretely, it means that building a UMD (or IIFE) bundle&#8239;—&#8239;where you might want to have many dependencies
inlined&#8239;—&#8239;after a CommonJS one&#8239;—&#8239;that usually does not inline so many dependencies&#8239;—&#8239;
will render a module that might prove difficult to use in a browser environment, since it does not include its dependencies

Conversely, building a UMD bundle first could make the next CJS or ES bundle much heavier than required, since the cached
modules from the UMD build would be considered non-external and, as such, be inlined within the CJS/ES bundles.

# Repro case

- `src/index.js`: the main source file, supposedly a library entry point, that exports the lib's function
- `src/lib/utils.js`: included to mock an external library that the main file depends on
- `build.js`: the build script, which creates CommonJS and UMD bundles of the source code using Rollup's JS API.

The build configuration for the CommonJS module includes the `external: ['./lib/utils']` option, which instructs Rollup not
to inline utils' code into the bundle.

The build configuration for the UMD module, on the other hand, uses `external: []`. The utils' code should then be inlined into
the UMD bundle. It is "necessary" (at least, much easier?) for the bundle to be useable directly in a browser using a `<script>`
tag.

## Current behavior

The build order is the following:
1. CJS module
2. UMD module, with cache from previous build
3. UMD module again, without cache

The resulting bundles show that:
- ✅ CJS module does not include utils' code
- ❌ UMD module #1 does not include utils' code either
- ✅ UMD module #2 includes utils' code

If the build order is changed to:
1. UMD module
2. CJS module, with cache from previous build
3. CJS module again, without cache

Then the result bundles show that:
- ✅ UMD module includes utils' code
- ❌ CJS module #1 includes utils' code as well
- ✅ CJS module #2 does not include utils' code

## Expected behavior

I'd expect Rollup to honor the `external` specification of each build's configuration, even when using the cache.
