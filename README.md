# simple-builder2-demo

This is a simple `component` builder demonstrating the use of [builder2.js](http://github.com/component/builder2.js).

To build the sample.

```
  $ ./bin/build
```

Or to run the minimal `koa` server that builds component for every request.

```
  $ node server
```


### `index.js`

```javascript
/**
 * Module dependencies
 */

var path = require('path');
var mkdir = require('mkdirp');
var Builder = require('component-builder2');
var Resolver = require('component-resolver');
var myth = require('builder-myth');
var debug = require('debug')('simple-builder2:builder');

/**
 * Retuns Generator Function that handles building component
 *
 * `params` can accept following options
 *
 * - `out`: output directory
 * - `bundled`: if you want to build bundled component
 */

module.exports = function(params){

  params = params || {};
  params.out = params.out || 'build';

  var copy = params.copy;

  return function*(){
    
    var resolver = new Resolver(process.cwd(), { install: true });
    var tree = yield* resolver.tree();
    var out = params.out;

    if(!params.bundled){
      debug('Building component to %s', out);
      yield buildBundle(resolver, tree, out);
    } else {
      for(var bundle in tree.locals){
        debug('Building a bundle: %s', bundle);
        out = path.resolve(params.out, bundle);
        yield buildBundle(resolver, tree.locals[bundle], out);
      }
    }
  };

  function* buildBundle(resolver, tree, out){

    // mkdir -p
    mkdir.sync(out);

    var nodes = resolver.flatten(tree); 

    /**
     * Builders
     */

    var script = new Builder.scripts(nodes);
    var style = new Builder.styles(nodes);
    var file = new Builder.files(nodes, {dest: out});

    /**
     * Script Plugin(s)
     */

    script.use('scripts', Builder.plugins.js());

    /**
     * Style Plugins
     *
     * - `myth`: Enables `myth`
     * - `urlRewriter`: Rewrite `url()` rules in css
     */

    style.use('styles', Builder.plugins.css());
    style.use('styles', myth({whitespace: false}));
    style.use('styles', Builder.plugins.urlRewriter());
    
    /**
     * File Plugins
     */

    file.use('images', Builder.plugins[copy ? 'copy' : 'symlink']());

    /**
     * Yield all :)
     */

    yield [
      script.toFile(path.resolve(out, 'build.js')),
      style.toFile(path.resolve(out, 'build.css')),
      file.end()
    ];
  }
};

```
