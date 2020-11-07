export interface IConfigLoader {
  init(): Promise<void> | void;
  get<T>(key: string, defaultValue?: T): T;
}
