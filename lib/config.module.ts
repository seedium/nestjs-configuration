import { defer } from 'rxjs';
import { DynamicModule, FactoryProvider } from '@nestjs/common';
import type { O } from 'ts-toolbelt';
import { Config } from './config.provider';
import { IConfigLoader, IConfigOptions } from './interfaces';
import { DotenvConfigLoader } from './loaders';

export class ConfigModule {
  static forFoot({
    pattern = '*.ts',
    ...options
  }: O.Optional<IConfigOptions, 'pattern'>): DynamicModule {
    const configProvider: FactoryProvider = {
      provide: Config,
      useFactory: async () =>
        await defer(async () => {
          const config = new Config(new DotenvConfigLoader(), {
            pattern,
            ...options,
          });
          await config.load();
          return config;
        }).toPromise(),
    };
    return {
      module: ConfigModule,
      exports: [configProvider],
      providers: [configProvider],
    };
  }
  static forFeature(
    configLoader: IConfigLoader,
    { pattern = '*.ts', ...options }: O.Optional<IConfigOptions, 'pattern'>,
  ): DynamicModule {
    const configProvider: FactoryProvider = {
      provide: Config,
      useFactory: async () =>
        await defer(async () => {
          const config = new Config(configLoader, {
            pattern,
            ...options,
          });
          await config.load();
          return config;
        }).toPromise(),
    };
    return {
      module: ConfigModule,
      exports: [configProvider],
      providers: [configProvider],
    };
  }
}
