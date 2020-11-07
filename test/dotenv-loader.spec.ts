import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as proxyquire from 'proxyquire';
import { DotenvConfigLoader } from '../lib';

chai.use(sinonChai);
const expect = chai.expect;

describe('DotenvLoader', () => {
  let config: DotenvConfigLoader;
  beforeEach(() => {
    process.env.CONFIG_TEST_STRING = 'some_string';
    process.env.CONFIG_TEST_FALSE = 'false';
    process.env.CONFIG_TEST_TRUE = 'true';
    config = new DotenvConfigLoader();
  });
  afterEach(() => {
    delete process.env.CONFIG_TEST_STRING;
    delete process.env.CONFIG_TEST_FALSE;
    delete process.env.CONFIG_TEST_TRUE;
  });
  it('should load .env file', () => {
    const stubConfig = sinon.stub();
    const { DotenvConfigLoader: MockedDotenvConfigLoader } = proxyquire(
      '../lib/loaders/dotenv-config.loader',
      {
        dotenv: {
          config: stubConfig,
        },
      },
    );
    const mockedDotenvConfigLoader = new MockedDotenvConfigLoader();
    mockedDotenvConfigLoader.init();
    expect(stubConfig).calledOnce;
  });
  it('should resolve `string` value', () => {
    const value = config.get('CONFIG_TEST_STRING');
    expect(value).eq('some_string');
  });
  it('should resolve `false` value', () => {
    const value = config.get('CONFIG_TEST_FALSE');
    expect(value).is.false;
  });
  it('should resolve `true` value', () => {
    const value = config.get('CONFIG_TEST_TRUE');
    expect(value).is.true;
  });
  it('should resolve default value if env not found', () => {
    const value = config.get('CONFIG_TEST_UNKNOWN', 'default_value');
    expect(value).eq('default_value');
  });
});
