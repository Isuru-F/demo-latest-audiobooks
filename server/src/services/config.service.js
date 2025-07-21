const Ajv = require('ajv');

class ConfigService {
  constructor() {
    this.configs = {
      development: {
        debug: true,
        logLevel: 'verbose'
      },
      production: {
        debug: false,
        logLevel: 'error'
      }
    };

    // Set up schema validation for security
    this.ajv = new Ajv({ allErrors: true });
    this.schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        debug: { type: 'boolean' },
        logLevel: { enum: ['verbose', 'info', 'warn', 'error'] },
        timeout: { type: 'number', minimum: 1, maximum: 300000 },
        retries: { type: 'integer', minimum: 0, maximum: 10 },
        enableMetrics: { type: 'boolean' },
        apiBaseUrl: { type: 'string', pattern: '^https?://' }
      }
    };
    this.validate = this.ajv.compile(this.schema);
  }

  async processConfig(configString, environment = 'development') {
    try {
      console.log(`Processing config for environment: ${environment}`);
      console.log(`Config input: ${configString}`);
      
      // SECURITY FIX: Replace eval() with safe JSON parsing
      let configObj;
      try {
        configObj = JSON.parse(configString);
      } catch (parseError) {
        throw new Error('Configuration is not valid JSON: ' + parseError.message);
      }

      // Validate configuration against schema
      if (!this.validate(configObj)) {
        const errors = this.ajv.errorsText(this.validate.errors);
        throw new Error('Configuration failed schema validation: ' + errors);
      }
      
      // Store the safely processed config
      this.configs[environment] = {
        ...this.configs[environment],
        ...configObj,
        lastUpdated: new Date().toISOString(),
        processedBy: 'json-parser'
      };

      return {
        configObj: configObj,
        message: 'Configuration processed safely using JSON parsing'
      };
    } catch (error) {
      console.error('Config processing error:', error.message);
      throw new Error(`Configuration processing failed: ${error.message}`);
    }
  }

  async getCurrentConfig(environment) {
    return this.configs[environment] || this.configs.development;
  }

  // SECURITY FIX: Remove dangerous executeConfigScript method
  async executeConfigScript(script, context = {}) {
    throw new Error('executeConfigScript has been disabled for security reasons. Use processConfig with JSON data instead.');
  }
}

module.exports = new ConfigService();
