import * as glob from 'glob';
import { promisify } from 'util';
import { resolve as resolvePath } from 'path';
import { OnApplicationShutdown } from '@nestjs/common';
import * as prop from 'lodash.property';
import * as merge from 'lodash.merge';
import * as isFunction from 'lodash.isfunction';
import * as isPlainObject from 'lodash.isplainobject';
import {
  IStore,
  IConfigOptions,
  IConfigLoader,
  IConfigBootSpec,
} from './interfaces';

const globAsync = promisify(glob);

export class Config<T extends IStore = IStore>
  implements OnApplicationShutdown {
  private _stores: T = {} as T;

  get store(): T {
    return this._stores;
  }
  constructor(
    private readonly _loader: IConfigLoader,
    private readonly _options: IConfigOptions,
  ) {}
  public onApplicationShutdown(): void {
    this._stores = {} as T;
  }
  public get<T extends unknown>(path: string, defaultValue?: T): T {
    const value = prop(path)(this._stores);
    if (value === undefined) {
      return defaultValue as T;
    }
    return value;
  }
  public async load(): Promise<void> {
    const maybePromise = this._loader.init();
    if (maybePromise instanceof Promise) {
      await maybePromise;
    }
    const modules = await this.importConfigs();
    modules.forEach((module) => (this._stores = merge(module, this._stores)));
  }
  protected async importConfigs(): Promise<Record<string, unknown>[]> {
    const files = await globAsync(
      resolvePath(this._options.path, this._options.pattern),
    );
    const importFiles = this.normalizeWithNamespaces(this._options.path, files);

    const configs = await Promise.all(
      Object.entries(importFiles).map(async ([namespace, configPath]) => {
        const module = await import(configPath);
        const config = module.default;

        if (isFunction(config)) {
          return {
            [namespace]: config(this._loader),
          };
        } else if (isPlainObject(config)) {
          return {
            [namespace]: config,
          };
        }
      }),
    );

    return configs.filter((config) => !!config) as Record<string, unknown>[];
  }
  protected normalizeWithNamespaces(
    basePath: string,
    configFiles: string[],
  ): IConfigBootSpec {
    return configFiles.reduce((acc, config) => {
      /*
       * TODO add support to erasing custom pattern and applying namespace without suffix
       * For example, if pattern was provided `*.config.ts`:
       * Current behaviour: namespace will be with name `<filename>.config`
       * Expected behaviour: namespace must be without custom pattern and has name `<filename>`
       * */
      const match = config.match(/([^\/]+)(?=\.\w+$)/);

      if (!match) {
        return acc;
      }

      const namespace = match[0];

      acc = {
        ...acc,
        [namespace]: config,
      };

      return acc;
    }, {});
  }
}
