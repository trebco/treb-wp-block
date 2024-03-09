
## TREB script

The plugin loads the TREB script (via the php file). In order to avoid
including that again in the bundled plugin module, we switch to a dynamic
import in the edit code. It seems to work well, the only drawback is that 
it's asynchronous but in practice that makes very little difference. 

## Versioning

We have a version number in four different places -- `package.json`, the
php file, the `src/block.json`, and the `readme.txt` file. This is going to 
get out of sync.

Similarly we're writing the TREB version to both the php and the block file.

We have a script that reads versions from `package.json` and from TREB in
the node_modules directory, then writes those versions to the relevant
files. This is set to run on build.

## ZIP file

The standard way to distribute plugins appears to be via zip file. But the 
zip file should not have a containing directory -- it should just hold naked
files. It seems like the plugin system itself can handle a directory but the
"validator" cannot. 

## Building (updated march 2024)

We should be able to build by just running `npm run plugin-zip`. the 
config is in the `files` block of `package.json`. That bundles the plugin
and creates the zip file.


