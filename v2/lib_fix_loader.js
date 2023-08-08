module.exports = function (source) {
  const modifiedSource = source.replace(/const { shaders } = await import\(url.toString\(\)\);/g, "const { shaders } = await import(/* webpackIgnore: true */ (new URL('.', window.location.origin + '/v2/'))+'shaders.js');");

  return modifiedSource;
};
