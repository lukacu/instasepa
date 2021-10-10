const Handlebars = require('handlebars/runtime');

function register(package) {

    for (var name in package) {
        Handlebars.registerHelper(name, package[name]);
    }

}

register(require('just-handlebars-helpers/lib/helpers/conditionals'));
register(require('just-handlebars-helpers/lib/helpers/math'));

Handlebars.registerHelper("fixed", (value, decimals) => { return (value).toFixed(decimals); } );

/**
 * Handlebars runtime with custom helpers.
 * Used by handlebars-loader.
 */
module.exports = Handlebars;
