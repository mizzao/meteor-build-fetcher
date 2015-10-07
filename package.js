Package.describe({
  name: "mizzao:build-fetcher",
  summary: 'Downloads remote code to be served as part of a Meteor app',
  version: '0.3.0',
  git: 'https://github.com/mizzao/meteor-build-fetcher.git'
});

Package.registerBuildPlugin({
    name: "fetcher",
    use: [
      'ecmascript@0.1.4',
      'http@1.1.1'
    ],
    sources: [
        'fetcher.js'
    ],
    npmDependencies: {}
});

Package.onUse(function(api) {
  api.versionsFrom("1.2.0.2");

  api.use('isobuild:compiler-plugin@1.0.0');
});
