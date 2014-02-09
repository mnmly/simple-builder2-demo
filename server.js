var koa = require('koa');
var app = koa();
var port = process.env.PORT || 3000;
var serve = require('koa-static');
var mount = require('koa-mount');
var build = require('./');
var params = { params: 'build', copy: true };

app.use(function*(next){
  if(/build\.(js|css)/.test(this.url)){
    yield build(params);
  }
  yield next;
});

app.use(mount('/build', serve(__dirname + '/build')));
app.use(function* (){
  this.body = '<!doctype html>' +
                '<html><head><link rel="stylesheet" href="/build/build.css"/></head><body>' +
                '<script src="/build/build.js"></script>' + 
                '<script>var Demo = require("demo"); new Demo();</script>' + 
              '</body></html>';
});

app.listen(port);
console.log('App is running on port: %s', port);
