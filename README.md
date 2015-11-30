meteor-build-fetcher
====================

## What's this do?

This package downloads remote code to be served as part of a Meteor app. Often, we run into the situation of having static files from a CDN as part of a Meteor application, and they get dumped into the `compatibility` folder, often in a minified form, and just end up taking up space in your repo. This package allows you to integrate such files into your Meteor app by having the server download them during the build process and serve them locally. It's a simpler way to accomplish what git submodules are sometimes used for and without depending on clients to be able to access external servers once the project is built.

Build fetcher can also help with not needing random bash scripts to download files into your project by making the download part of the build process.

## Usage

Files with the extension `.fetch.json` are processed by this plugin. Each such file should contain an array of the following form:

```js
[
    {
        "file": "ace.js",
        "url": "https://raw.github.com/ajaxorg/ace-builds/3bded0bc1b5b51f74afd2f8dafb768ab8f35b00b/src-min/ace.js",
        "bare": true
    }
]
```

* `file`: specifies the local filename. The file will appear in the same directory as the `.fetch.json` file.
* `url`: specifies the remote url that the file will be fetched from.
* `bare`: for Javascript files, whether the file should be wrapped in a closure.

Meteor will treat a `foo.fetch.json` file as a normal part of the build process. If the file changes, the builder will go through and download all of the sources again. If the file doesn't change, the built source (i.e. fetched files) will be kept in place.

### In regular apps

First, install the package:

```
$ meteor add mizzao:build-fetcher
```

Then, just put a `foo.fetch.json` file whereever you want, and Javascript files will magically appear as part of your app when it is built. If it is in the `client` directory, it will appear in the client manifest, and so on for the server.

### In smart packages

```js
Package.onUse(function (api) {
  api.use("mizzao:build-fetcher@VERSION");

  // ... other stuff
});
```

where `VERSION` is the usually the latest available version of this package.

Then, you will need to manually load the `.fetch.json` with a `Package.use`
command. Be sure to specify `client` or `server`, or leave it out if you want
both.

### Examples

* https://github.com/mizzao/meteor-jqueryui/blob/master/jqueryui.fetch.json downloads the jquery-ui javascript, css, and theme images for the meteor-jqueryui package.
* https://github.com/mizzao/meteor-openlayers/blob/master/openlayers.fetch.json downloads the JS and CSS files for the OpenLayers mapping library.

### Notes

* The package uses Meteor's `caching-compiler` to download files only when the 
contents of the `.fetch.json` file change.
* It would be nice to figure out clean ways to support non-JS and non-CSS content of different forms. Currently only binary is supported.
