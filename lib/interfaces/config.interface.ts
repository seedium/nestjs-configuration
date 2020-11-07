export type IStore = Record<string, unknown>;

export interface IConfigBootSpec {
  [namespace: string]: string;
}

export interface IConfigOptions {
  path: string;
  pattern: string;
}
