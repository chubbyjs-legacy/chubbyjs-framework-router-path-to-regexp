import UriInterface from '@chubbyjs/psr-http-message/dist/UriInterface';

class UriDouble implements UriInterface {
    getSchema(): string {
        throw new Error('Method not implemented.');
    }
    getAuthority(): string {
        throw new Error('Method not implemented.');
    }
    getUserInfo(): string {
        throw new Error('Method not implemented.');
    }
    getHost(): string {
        throw new Error('Method not implemented.');
    }
    getPort(): number {
        throw new Error('Method not implemented.');
    }
    getPath(): string {
        throw new Error('Method not implemented.');
    }
    getQuery(): string {
        throw new Error('Method not implemented.');
    }
    getFragment(): string {
        throw new Error('Method not implemented.');
    }
    withScheme(scheme: string): this {
        throw new Error('Method not implemented.');
    }
    withUserInfo(user: string, password?: string): this {
        throw new Error('Method not implemented.');
    }
    withHost(scheme: string): this {
        throw new Error('Method not implemented.');
    }
    withPort(port?: number): this {
        throw new Error('Method not implemented.');
    }
    withPath(scheme: string): this {
        throw new Error('Method not implemented.');
    }
    withQuery(scheme: string): this {
        throw new Error('Method not implemented.');
    }
    withFragment(scheme: string): this {
        throw new Error('Method not implemented.');
    }
    toString(): string {
        throw new Error('Method not implemented.');
    }
}

export default UriDouble;
