/**
 * Security tests to verify eval() vulnerability is fixed in config service
 */
const configService = require('../../src/services/config.service');

describe('Config Service Security', () => {
  beforeEach(() => {
    // Reset config state
    configService.configs = {
      development: { debug: true, logLevel: 'verbose' },
      production: { debug: false, logLevel: 'error' }
    };
  });

  test('should reject malicious JavaScript code execution attempts', async () => {
    const maliciousConfigs = [
      'process.exit(1)',
      'require("fs").unlinkSync("*")',
      'console.log("hacked")',
      '(() => { while(true) {} })()',
      'global.process = null'
    ];

    for (const maliciousConfig of maliciousConfigs) {
      await expect(configService.processConfig(maliciousConfig, 'test'))
        .rejects.toThrow('Config is not valid JSON');
    }
  });

  test('should accept valid JSON configuration', async () => {
    const validConfig = JSON.stringify({
      debug: false,
      logLevel: 'warn'
    });

    const result = await configService.processConfig(validConfig, 'test');
    
    expect(result.configObj.debug).toBe(false);
    expect(result.configObj.logLevel).toBe('warn');
    expect(result.message).toBe('Configuration processed safely (no eval)');
  });

  test('should validate configuration schema strictly', async () => {
    const invalidConfigs = [
      // Unknown properties
      JSON.stringify({ debug: true, maliciousProperty: 'hack' }),
      // Invalid types
      JSON.stringify({ debug: 'not-boolean', logLevel: 'verbose' }),
      // Invalid enum values
      JSON.stringify({ debug: true, logLevel: 'invalid' }),
      // Invalid number ranges
      JSON.stringify({ timeout: -5 }),
      JSON.stringify({ retries: 15 })
    ];

    for (const invalidConfig of invalidConfigs) {
      await expect(configService.processConfig(invalidConfig, 'test'))
        .rejects.toThrow('Config validation failed');
    }
  });

  test('should process valid configurations with all allowed fields', async () => {
    const validConfig = JSON.stringify({
      debug: true,
      logLevel: 'info',
      timeout: 5000,
      retries: 3
    });

    const result = await configService.processConfig(validConfig, 'test');
    
    expect(result.configObj).toEqual({
      debug: true,
      logLevel: 'info',
      timeout: 5000,
      retries: 3
    });
  });

  test('should not have executeConfigScript method (removed for security)', () => {
    expect(typeof configService.executeConfigScript).toBe('undefined');
  });

  test('should merge with existing configuration safely', async () => {
    const config = JSON.stringify({ debug: false });
    
    await configService.processConfig(config, 'development');
    
    const result = await configService.getCurrentConfig('development');
    expect(result.debug).toBe(false);
    expect(result.logLevel).toBe('verbose'); // Original value preserved
    expect(result.processedBy).toBe('json-validation');
  });
});
