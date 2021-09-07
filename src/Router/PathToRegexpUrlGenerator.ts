import MissingRouteByNameError from '@chubbyjs/chubbyjs-framework/dist/Router/Error/MissingRouteByNameError';
import RouteGenerationError from '@chubbyjs/chubbyjs-framework/dist/Router/Error/RouteGenerationError';
import RouteInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RouteInterface';
import RoutesInterface from '@chubbyjs/chubbyjs-framework/dist/Router/RoutesInterface';
import UrlGeneratorInterface from '@chubbyjs/chubbyjs-framework/dist/Router/UrlGeneratorInterface';
import ServerRequestInterface, { QueryParams } from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import { compile, PathFunction } from 'path-to-regexp';
import { stringify } from 'qs';

class PathToRegexpUrlGenerator implements UrlGeneratorInterface {
    private routesByName: Map<string, RouteInterface>;
    private compilersByName: Map<string, PathFunction> = new Map();

    public constructor(routes: RoutesInterface) {
        this.routesByName = routes.getRoutesByName();
        this.routesByName.forEach((route, name) => {
            this.compilersByName.set(name, compile(route.getPath()));
        });
    }

    public generateUrl(
        request: ServerRequestInterface,
        name: string,
        attributes?: Map<string, any>,
        queryParams?: QueryParams,
    ): string {
        const uri = request.getUri();
        const path = this.generatePath(name, attributes, queryParams);

        return uri.getSchema() + '://' + uri.getAuthority() + path;
    }

    public generatePath(name: string, attributes?: Map<string, string>, queryParams?: QueryParams): string {
        const route = this.routesByName.get(name);

        if (undefined === route) {
            throw MissingRouteByNameError.create(name);
        }

        const compiler = this.compilersByName.get(name) as PathFunction;

        let path = '';

        try {
            path = compiler(undefined !== attributes ? Object.fromEntries(attributes) : {});

            if (undefined !== queryParams) {
                path += '?' + stringify(queryParams);
            }
        } catch (e) {
            throw RouteGenerationError.create(name, route.getPath(), attributes, e as Error);
        }

        return path;
    }
}

export default PathToRegexpUrlGenerator;
