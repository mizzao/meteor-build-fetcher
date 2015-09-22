function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var Future = Npm.require('fibers/future');
var request = Npm.require('request');

/*
 Create a handler for fetch.json files
 This is convenient because it will only ever get the file once
 unless the .fetch.json target changes
 */
class Fetcher {

  fetch(file) {
    const targets = JSON.parse(file.getContentsAsString());

    for( var i = 0; i < targets.length; i++ ) {
      var target = targets[i];
      console.log("Downloading " + target.url + " to " + target.file);

      if( endsWith(target.file, ".js") ) {
        var output = HTTP.get(target.url).content;

        file.addJavaScript({
          path: target.file,
          data: output,
          sourcePath: target.file,
          bare: target.bare || false
        });
      }
      else if( endsWith(target.file, ".css") ) {
        var output = HTTP.get(target.url).content;

        file.addStylesheet({
          path: target.file,
          data: output
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
        file.addAsset({
          path: target.file,
          data: fut.wait()
        });
      }
    }
  }

  processFilesForTarget(files) {
    files.forEach( (file) => {
      this.fetch(file);
    });
  }
}

Plugin.registerCompiler({
  extensions: [ "fetch.json" ],
  filenames: []
}, function() {
  return new Fetcher();
});
