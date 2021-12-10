/**
 * Exposes a Command Line interface to interact with transpiled {@link DSUBlueprint}s
 *
 * Available actions: {@link CliActions}
 *
 * Available options: {@link CliOptions} eg for option 'action':
 * <pre>
 *     node ./node_modules/@tvenceslau/dsu-blueprint/lib/cli --action=build
 * </pre>
 *
 * @namespace cli
 * @memberOf dsu-blueprint
 */

export * from './cli';