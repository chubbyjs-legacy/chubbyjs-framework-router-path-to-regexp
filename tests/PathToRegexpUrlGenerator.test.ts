import RouteInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RouteInterface';
import RoutesInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RoutesInterface';
import Call from '@chubbyjs/chubbyjs-mock/dist/Call';
import MockByCalls from '@chubbyjs/chubbyjs-mock/dist/MockByCalls';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import UriInterface from '@chubbyjs/psr-http-message/dist/UriInterface';
import { describe, expect, test } from '@jest/globals';
import PathToRegexpUrlGenerator from '../src/PathToRegexpUrlGenerator';
import ServerRequestDouble from './Double/Psr/HttpMessage/ServerRequestDouble';
import UriDouble from './Double/Psr/HttpMessage/UriDouble';
import RouteDouble from './Double/Router/RouteDouble';
import RoutesDouble from './Double/Router/RoutesDouble';

const mockByCalls = new MockByCalls();

describe('PathToRegexpUrlGenerator', () => {
    test('generateUrl', () => {
        const route = mockByCalls.create<RouteInterface>(RouteDouble, [
            Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
        ]);

        const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
            Call.create('getRoutesByName')
                .with()
                .willReturn(new Map([['hello', route]])),
        ]);

        const uri = mockByCalls.create<UriInterface>(UriDouble, [
            Call.create('getSchema').with().willReturn('https'),
            Call.create('getAuthority').with().willReturn('user:password@localhost:8443'),
        ]);

        const request = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
            Call.create('getUri').with().willReturn(uri),
        ]);

        const routeGenerator = new PathToRegexpUrlGenerator(routes);

        expect(routeGenerator.generateUrl(request, 'hello', new Map([['name', 'world']]), { key: 'value' })).toBe(
            'https://user:password@localhost:8443/hello/world?key=value',
        );
    });

    describe('generatePath', () => {
        test('with attributes and query params', () => {
            const route = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
            ]);

            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName')
                    .with()
                    .willReturn(new Map([['hello', route]])),
            ]);

            const routeGenerator = new PathToRegexpUrlGenerator(routes);

            expect(routeGenerator.generatePath('hello', new Map([['name', 'world']]), { key: 'value' })).toBe(
                '/hello/world?key=value',
            );
        });

        test('with attributes', () => {
            const route = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
            ]);

            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName')
                    .with()
                    .willReturn(new Map([['hello', route]])),
            ]);

            const routeGenerator = new PathToRegexpUrlGenerator(routes);

            expect(routeGenerator.generatePath('hello', new Map([['name', 'world']]))).toBe('/hello/world');
        });

        test('without attributes', () => {
            const route = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/world'),
            ]);

            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName')
                    .with()
                    .willReturn(new Map([['hello', route]])),
            ]);

            const routeGenerator = new PathToRegexpUrlGenerator(routes);

            expect(routeGenerator.generatePath('hello')).toBe('/hello/world');
        });

        test('missing attribute', () => {
            const route = mockByCalls.create<RouteInterface>(RouteDouble, [
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
                Call.create('getPath').with().willReturn('/hello/:name([a-z]+)'),
            ]);

            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName')
                    .with()
                    .willReturn(new Map([['hello', route]])),
            ]);

            const routeGenerator = new PathToRegexpUrlGenerator(routes);

            expect(() => {
                routeGenerator.generatePath('hello');
            }).toThrow(
                'Route generation for route "hello" with pattern "/hello/:name([a-z]+)" with attributes "" failed. Cause: Expected "name" to be a string',
            );
        });

        test('missing route', () => {
            const routes = mockByCalls.create<RoutesInterface>(RoutesDouble, [
                Call.create('getRoutesByName').with().willReturn(new Map()),
            ]);

            const routeGenerator = new PathToRegexpUrlGenerator(routes);

            expect(() => {
                routeGenerator.generatePath('hello');
            }).toThrow('Missing route: "hello"');
        });
    });
});
