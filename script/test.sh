# TODO: Make it so only the client tests require jsdom-global/register
# TODO: Make it so the client tests do not have access to Node.js-specific methods
mocha --parallel --require jsdom-global/register 'dist/test/**/*.spec.js' $@