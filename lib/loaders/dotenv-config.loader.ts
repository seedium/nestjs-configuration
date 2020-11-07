import * as dotenv from 'dotenv';
import { IConfigLoader } from '../interfaces';

export class DotenvConfigLoader implements IConfigLoader {
  constructor(private readonly _options?: dotenv.DotenvConfigOptions) {}
  public init(): void {
    dotenv.config(this._options);
  }
  public get<T>(key: string, defaultValue?: T): T {
    const value = process.env[key] || defaultValue;
    return this.parseBooleanValue<T>(value);
  }
  protected parseBooleanValue<T = unknown>(value: unknown): T {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    return value as T;
  }
}
