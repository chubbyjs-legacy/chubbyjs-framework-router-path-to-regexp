import RouteInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RouteInterface';
import RoutesInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RoutesInterface';
import ArgumentCallback from '@chubbyjs/chubbyjs-mock/dist/Argument/ArgumentCallback';
import Call from '@chubbyjs/chubbyjs-mock/dist/Call';
import MockByCalls from '@chubbyjs/chubbyjs-mock/dist/MockByCalls';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import UriInterface from '@chubbyjs/psr-http-message/dist/UriInterface';
import { describe, expect, test } from '@jest/globals';
import PathToRegexpRouteMatcher from '../../src/Router/PathToRegexpRouteMatcher';
import ServerRequestDouble from '../Double/Psr/HttpMessage/ServerRequestDouble';
import UriDouble from '../Double/Psr/HttpMessage/UriDouble';
import RouteDouble from '../Double/Router/RouteDouble';
import RoutesDouble from '../Double/Router/RoutesDouble';

const mockByCalls = new MockByCalls();

describe('PathToRegexpRouteMatcher', () => {
    describe('match', () => {
        test('with match', () => {
            const routeWithAttributes = mockByCalls.create<RouteInterface>(RouteDouble);

            const route = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
                Call.create('getMethod').with().willReturn('GET'),
                Call.create('withAttributes')
                    .with(
                        new ArgumentCallback((attributes: Map<string, string>) => {
                            expect(attributes).toEqual(new Map([['name', 'world']]));
                        }),
                    )
                    .willReturn(routeWithAttributes),
            ]);

            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName')
                    .with()
                    .willReturn(new Map([['hello', route]])),
            ]);

            const uri = mockByCalls.create<UriInterface>(UriDouble, [
                Call.create('getPath').with().willReturn('/hello/world'),
            ]);

            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('getMethod').with().willReturn('GET'),
                Call.create('getUri').with().willReturn(uri),
            ]);

            const routeMatcher = new PathToRegexpRouteMatcher(routes);

            expect(routeMatcher.match(request)).toBe(routeWithAttributes);
        });

        test('with match two matching uri, different method', () => {
            const route1 = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
                Call.create('getMethod').with().willReturn('GET'),
            ]);

            const route2WithAttributes = mockByCalls.create<RouteInterface>(RouteDouble);

            const route2 = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
                Call.create('getMethod').with().willReturn('POST'),
                Call.create('withAttributes')
                    .with(
                        new ArgumentCallback((attributes: Map<string, string>) => {
                            expect(attributes).toEqual(new Map([['name', 'world']]));
                        }),
                    )
                    .willReturn(route2WithAttributes),
            ]);

            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName')
                    .with()
                    .willReturn(
                        new Map([
                            ['hello_get', route1],
                            ['hello_post', route2],
                        ]),
                    ),
            ]);

            const uri = mockByCalls.create<UriInterface>(UriDouble, [
                Call.create('getPath').with().willReturn('/hello/world'),
            ]);

            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('getMethod').with().willReturn('POST'),
                Call.create('getUri').with().willReturn(uri),
            ]);

            const routeMatcher = new PathToRegexpRouteMatcher(routes);

            expect(routeMatcher.match(request)).toBe(route2WithAttributes);
        });

        test('with matching uri, but wrong method', () => {
            const route = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
                Call.create('getMethod').with().willReturn('POST'),
            ]);

            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName')
                    .with()
                    .willReturn(new Map([['hello', route]])),
            ]);

            const uri = mockByCalls.create<UriInterface>(UriDouble, [
                Call.create('getPath').with().willReturn('/hello/world'),
            ]);

            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('getMethod').with().willReturn('GET'),
                Call.create('getUri').with().willReturn(uri),
            ]);

            const routeMatcher = new PathToRegexpRouteMatcher(routes);

            expect(() => {
                routeMatcher.match(request);
            }).toThrow('Method "GET" at path "/hello/world" is not allowed. Must be one of: "POST".');
        });

        test('without match', () => {
            const route = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
                Call.create('getMethod').with().willReturn('POST'),
            ]);

            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName')
                    .with()
                    .willReturn(new Map([['hello', route]])),
            ]);

            const uri = mockByCalls.create<UriInterface>(UriDouble, [Call.create('getPath').with().willReturn('/')]);

            const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('getMethod').with().willReturn('GET'),
                Call.create('getUri').with().willReturn(uri),
            ]);

            const routeMatcher = new PathToRegexpRouteMatcher(routes);

            expect(() => {
                routeMatcher.match(request);
            }).toThrow(
                'The page "/" you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly.',
            );
        });
    });
});
