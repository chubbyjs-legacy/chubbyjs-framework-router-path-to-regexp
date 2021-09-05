import { Method } from '@chubbyjs/psr-http-message/dist/RequestInterface';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import { match, MatchFunction } from 'path-to-regexp';
import MethodNotAllowedError from '@chubbyjs/chubbyjs-framework/dist/Router/Error/MethodNotAllowedError';
import NotFoundError from '@chubbyjs/chubbyjs-framework/dist/Router/Error/NotFoundError';
import RouteInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RouteInterface';
import RouteMatcherInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RouteMatcherInterface';
import RoutesInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RoutesInterface';

class PathToRegexpRouteMatcher implements RouteMatcherInterface {
    private routesByName: Map<string, RouteInterface>;
    private matchersByName: Map<string, MatchFunction> = new Map();

    public constructor(routes: RoutesInterface) {
        this.routesByName = routes.getRoutesByName();
        this.routesByName.forEach((route, name) => {
            this.matchersByName.set(name, match(route.getPath()));
        });
    }

    public match(request: ServerRequestInterface): RouteInterface {
        const method = request.getMethod();
        const path = decodeURI(request.getUri().getPath());

        const matchWithMethods: Array<Method> = [];

        for (const [name, route] of this.routesByName.entries()) {
            const match = this.matchersByName.get(name) as MatchFunction;

            const matchedPath = match(path);

            if (!matchedPath) {
                continue;
            }

            const routeMethod = route.getMethod();

            if (routeMethod === method) {
                return route.withAttributes(new Map(Object.entries(matchedPath.params)));
            }

            matchWithMethods.push(routeMethod);
        }

        if (matchWithMethods.length > 0) {
            throw MethodNotAllowedError.create(path, method, matchWithMethods);
        }

        throw NotFoundError.create(path);
    }
}

export default PathToRegexpRouteMatcher;
