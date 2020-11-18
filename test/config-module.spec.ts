import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Test } from '@nestjs/testing';
import {
  Config,
  ConfigModule,
  DotenvConfigLoader,
  IConfigLoader,
} from '../lib';

chai.use(sinonChai);
const expect = chai.expect;

describe('ConfigModule', () => {
  class TestLoader implements IConfigLoader {
    get<T>(): T {
      return {} as T;
    }
    init(): Promise<void> | void {}
  }
  afterEach(() => {
    sinon.restore();
  });
  it('should provide `DotenvConfigLoader` by default', async () => {
    const testModule = await Test.createTestingModule({
      imports: [ConfigModule.forFoot({ path: 'test' })],
    }).compile();
    const config = testModule.get(Config);
    expect(config).instanceOf(Config);
    expect(config).property('_loader').instanceOf(DotenvConfigLoader);
  });
  it('should provide custom provide', async () => {
    const testModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(new TestLoader(), { path: 'test' })],
    }).compile();
    const config = testModule.get(Config);
    expect(config).instanceOf(Config);
    expect(config).property('_loader').instanceOf(TestLoader);
  });
  it('module by default should be scoped', async () => {
    const dynamicModule = ConfigModule.forFoot({ path: 'test' });
    expect(dynamicModule).property('global').is.false;
  });
  it('module can be set as a global', () => {
    const dynamicModule = ConfigModule.forFoot({ path: 'test', global: true });
    expect(dynamicModule).property('global').is.true;
  });
});
