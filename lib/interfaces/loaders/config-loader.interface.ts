export interface IConfigLoader {
  init(): Promise<void> | void;
  get<T>(_key: string, _defaultValue?: T): T;
}
