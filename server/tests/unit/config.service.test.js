const configService = require('../../src/services/config.service');

describe('ConfigService - Security Tests', () => {
  beforeEach(async () => {
    // Reset service state between tests
    await configService.processConfig('{"debug": true}', 'test');
  });

  describe('processConfig', () => {
    test('should safely process valid JSON configuration', async () => {
      const validConfig = '{"debug": false, "logLevel": "error"}';
      const result = await configService.processConfig(validConfig, 'test');

      expect(result.configObj).toEqual({
        debug: false,
        logLevel: 'error'
      });
      expect(result.message).toBe('Configuration processed safely using JSON parsing');
    });

    test('should reject malicious JavaScript code', async () => {
      const maliciousConfig = 'console.log("hacked"); process.exit(1);';
      
      await expect(configService.processConfig(maliciousConfig, 'test'))
        .rejects.toThrow('Configuration is not valid JSON');
    });

    test('should reject eval-based attacks', async () => {
      const evalAttack = 'eval("console.log(\\"attack\\")");';
      
      await expect(configService.processConfig(evalAttack, 'test'))
        .rejects.toThrow('Configuration is not valid JSON');
    });

    test('should validate configuration against schema', async () => {
      const invalidConfig = '{"invalidProperty": "notAllowed", "logLevel": "invalidLevel"}';
      
      await expect(configService.processConfig(invalidConfig, 'test'))
        .rejects.toThrow('Configuration failed schema validation');
    });

    test('should accept valid configuration properties', async () => {
      const validConfig = JSON.stringify({
        debug: true,
        logLevel: 'verbose',
        timeout: 5000,
        retries: 3,
        enableMetrics: true
      });
      
      const result = await configService.processConfig(validConfig, 'test');
      expect(result.configObj.debug).toBe(true);
      expect(result.configObj.logLevel).toBe('verbose');
      expect(result.configObj.timeout).toBe(5000);
    });

    test('should enforce property constraints', async () => {
      const invalidConfig = JSON.stringify({
        timeout: -1, // Invalid: negative timeout
        retries: 20  // Invalid: too many retries
      });
      
      await expect(configService.processConfig(invalidConfig, 'test'))
        .rejects.toThrow('Configuration failed schema validation');
    });
  });

  describe('executeConfigScript', () => {
    test('should be disabled for security', async () => {
      await expect(configService.executeConfigScript('console.log("test")'))
        .rejects.toThrow('executeConfigScript has been disabled for security reasons');
    });
  });

  describe('getCurrentConfig', () => {
    test('should return processed configuration', async () => {
      const testConfig = '{"debug": false, "logLevel": "warn"}';
      await configService.processConfig(testConfig, 'test');
      
      const config = await configService.getCurrentConfig('test');
      expect(config.debug).toBe(false);
      expect(config.logLevel).toBe('warn');
      expect(config.processedBy).toBe('json-parser');
    });
  });
});
