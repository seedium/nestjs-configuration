import * as path from 'path';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as proxyquire from 'proxyquire';
import { Config, IConfigLoader } from '../lib';
import configFile from './configs/test';
import configObjectFile from './configs/object_config';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

describe('Config', async () => {
  let config: Config;
  class TestLoader implements IConfigLoader {
    get<T>(): T {
      return {} as T;
    }
    init(): Promise<void> | void {}
  }
  afterEach(() => {
    if (config) {
      config.onApplicationShutdown();
    }
    sinon.restore();
  });
  describe('Load default configs', () => {
    beforeEach(async () => {
      config = new Config(new TestLoader(), {
        path: path.join(__dirname, 'configs'),
        pattern: '*.ts',
      });
      await config.load();
    });
    it('should load configs from provided folder', async () => {
      const configObject = configFile();
      expect(config).property('_stores').property('test').deep.eq(configObject);
    });
    it('getter `store` should return object with all configs', () => {
      const configObject = configFile();
      expect(config.store).property('test').deep.eq(configObject);
    });
    it('should load pure object config', () => {
      const configObject = configObjectFile;
      expect(config)
        .property('_stores')
        .property('object_config')
        .deep.eq(configObject);
    });
    it('should load config from async function', () => {
      expect(config)
        .property('_stores')
        .property('async_test')
        .property('foo')
        .eq('bar');
    });
    it('should miss other type of export default', () => {
      expect(config).property('_stores').not.property('class_config');
    });
  });
  it('should init async loader', async () => {
    const testLoader = new TestLoader();
    const asyncStubInit = sinon.stub(testLoader, 'init').resolves();
    const configAsync = new Config(testLoader, {
      path: path.join(__dirname, 'configs'),
      pattern: '*.ts',
    });
    await configAsync.load();
    expect(asyncStubInit).calledOnce;
  });
  it('should load configs with custom pattern', async () => {
    const customConfigPattern = new Config(new TestLoader(), {
      path: path.join(__dirname, 'custom-patterns'),
      pattern: '*.config.ts',
    });
    await customConfigPattern.load();
    expect(customConfigPattern)
      .property('_stores')
      .property('test_custom.config');
    expect(customConfigPattern).property('_stores').not.property('test');
  });
  it('if files are wrong should skip normalizing', async () => {
    const stubSyncGlob = sinon.stub().callsFake(() => ['test']);
    const { Config: ConfigProvider } = proxyquire('../lib/config.provider', {
      glob: {
        sync: stubSyncGlob,
      },
    });
    const options = { path: path.join(__dirname, 'configs'), pattern: '*.ts' };
    const testConfig = new ConfigProvider(new TestLoader(), options);
    await testConfig.load();
    expect(testConfig.store).not.property('test');
  });
  describe('Resolving', () => {
    beforeEach(async () => {
      config = new Config(new TestLoader(), {
        path: path.join(__dirname, 'configs'),
        pattern: '*.ts',
      });
      await config.load();
    });
    describe('config values', () => {
      it('should resolve `string` value', () => {
        expect(config.get('test.string')).eq('value');
      });
      it('should resolve `true` value', () => {
        expect(config.get('test.testTrue')).is.true;
      });
      it('should resolve `false` value', () => {
        expect(config.get('test.testFalse')).is.false;
      });
      it('should resolve `undefined` value', () => {
        expect(config.get('test.undefined')).is.undefined;
      });
      it('should resolve `undefined` if value not found', () => {
        expect(config.get('test.unknown')).is.undefined;
      });
      it('should get nested `string` key', () => {
        expect(config.get('test.nested.string')).eq('value');
      });
      it('should get nested `false` key', () => {
        expect(config.get('test.nested.testFalse')).is.false;
      });
      it('should get nested `undefined` key', () => {
        expect(config.get('test.nested.undefined')).is.undefined;
      });
      it('if key not found should return undefined', () => {
        expect(config.get('test.nested.unknown')).is.undefined;
      });
      it('if default value is specified and key was not found should return devault value', () => {
        expect(config.get('test.nested.unknown', 5)).eq(5);
      });
    });
  });
});
