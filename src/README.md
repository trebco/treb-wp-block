
We have a version number in four different places -- `package.json`, the
php file, the `src/block.json`, and the `readme.txt` file. This is going to 
get out of sync.

We have a script that reads versions from `package.json` and from TREB in
the node_modules directory, then writes those versions to the relevant
files. This is set to run on build.
