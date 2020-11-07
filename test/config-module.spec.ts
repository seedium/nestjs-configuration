import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Test } from '@nestjs/testing';
import { Config, ConfigModule, IConfigLoader } from '../lib';

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
  it('should provide', async () => {
    const testModule = await Test.createTestingModule({
      imports: [ConfigModule.forFoot(new TestLoader(), { path: 'test' })],
    }).compile();
    const config = testModule.get(Config);
    expect(config).instanceOf(Config);
  });
});
