Package.describe({
  summary: 'Downloads remote code to be served as part of a Meteor app',
  version: '0.2.0',
  git: 'https://github.com/mizzao/meteor-build-fetcher.git'
});

Package._transitional_registerBuildPlugin({
    name: "fetcher",
    use: [ 'http' ],
    sources: [
        'fetcher.js'
    ],
    npmDependencies: {}
});
