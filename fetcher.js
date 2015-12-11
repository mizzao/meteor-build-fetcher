var Future = Npm.require('fibers/future');
var request = Npm.require('request');

/*
  We use CachingCompiler to download the file, which
  will only ever get the file once
  unless the .fetch.json target changes:
  https://atmospherejs.com/meteor/caching-compiler

  This means we have to store the downloaded stuff.
 */
class Fetcher extends CachingCompiler {

  constructor() {
    super({
      compilerName: "build-fetcher",
      defaultCacheSize: 1024 * 1024 * 10
    });
  }

  getCacheKey(inputFile) {
    return inputFile.getSourceHash();
  }

  compileOneFile(file) {
    const targets = JSON.parse(file.getContentsAsString());

    // compileResult is just an array of {func, arg} to call.
    const compileResult = [];

    for( var i = 0; i < targets.length; i++ ) {
      var target = targets[i];
      console.log("Downloading " + target.url + " to " + target.file);

      if( target.file.endsWith(".js") ) {
        var output = HTTP.get(target.url).content;

        compileResult.push({
          func: "addJavaScript",
          arg: {
            path: target.file,
            data: output,
            sourcePath: target.file,
            bare: target.bare || false
          }
        });
      }
      else if( target.file.endsWith(".css") ) {
        var output = HTTP.get(target.url).content;

        compileResult.push({
          func: "addStylesheet",
          arg: {
            path: target.file,
            data: output
          }
        });
      }
      else {
        var fut = new Future();

        // Get a binary file as a buffer
        request({
          url: target.url,
          encoding: null
        }, function(err, res, body) {
          if( err ) {
            fut.throw(err);
          }
          else {
            // Return the buffer as the asset
            fut.return(body);
          }
        });

        // addAsset takes a buffer, which we get from the request
        compileResult.push({
          func: "addAsset",
          arg: {
            path: target.file,
            data: fut.wait()
          }
        });
      }
    }

    return compileResult;
  }

  // Add up length of all cached data pieces.
  compileResultSize(compileResult) {
    return compileResult.reduce( (val, el) => {
      return val + el.arg.data.length;
    }, 0);
  }

  addCompileResult(inputFile, compileResult) {
    for (const item of compileResult) {
      // If a buffer has been serialized to an array, make it back into a buffer
      // https://github.com/mizzao/meteor-build-fetcher/issues/4
      if( Array.isArray(item.arg.data) ) {
        item.arg.data = new Buffer(item.arg.data);
      }
      inputFile[item.func](item.arg);
    }
  }
}

Plugin.registerCompiler({
  extensions: [ "fetch.json" ]
}, () => new Fetcher() );
