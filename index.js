/**
 * Module dependencies
 */
var co = require('co');
var mkdir = require('mkdirp');
var path = require('path');
var Builder = require('component-builder2');
var Resolver = require('component-resolver');

var params = {};
params.out = params.out || 'build';

co(function*(){
  
  var resolver = new Resolver(process.cwd(), { install: true });
  var tree = yield* resolver.tree();
  var out = params.out;
  var nodes = resolver.flatten(tree);

  // mkdir -p
  mkdir.sync(out);

  var script = new Builder.scripts(nodes);
  var style = new Builder.styles(nodes);

  // Script Plugins
  script.use('scripts', Builder.plugins.js());

  // Style Plugins
  style.use('styles', Builder.plugins.css());

  yield [
    script.toFile(path.resolve(out, 'build.js')),
    style.toFile(path.resolve(out, 'build.css'))
  ];

})();

