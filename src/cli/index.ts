/**
 * Exposes a Command Line interface to interact with transpiled {@link DSUBlueprint}s
 *
 * Available actions: {@link CliActions}
 *
 * Available options: {@link CliOptions} eg for option 'action':
 *
 * @namespace dsu-blueprint.cli
 * @memberOf dsu-blueprint
 *
 * @example
 * node ./node_modules/@tvenceslau/dsu-blueprint/lib/cli --action=build
 */

export * from './cli';