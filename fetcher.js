function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/*
    Create a handler for fetch.json files
    This is convenient because it will only ever get the file once
    unless the .fetch.json target changes
 */
var handler = function (compileStep) {
    var targets = JSON.parse(compileStep.read().toString('utf8'));

    for( var i = 0; i < targets.length; i++ ) {
        var target = targets[i];
        console.log("Downloading " + target.url + " to " + target.file);
        var output = HTTP.get(target.url).content;

        if( endsWith(target.file, ".js") ) {
            compileStep.addJavaScript({
                path: target.file,
                data: output,
                sourcePath: target.file,
                bare: target.bare || false
            });
        }
        else if( endsWith(target.file, ".css") ) {
            compileStep.addStylesheet({
                path: target.file,
                data: output
            });
        }
        else {
            compileStep.addAsset({
                path: target.file,
                data: new Buffer(output) // XXX I don't think this is what we want
            });
        }
    };
};

Plugin.registerSourceHandler("fetch.json", handler);
