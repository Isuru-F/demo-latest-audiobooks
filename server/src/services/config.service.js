const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});

const configSchema = {
  type: 'object',
  additionalProperties: false,      // reject unknown keys
  properties: {
    debug:     { type: 'boolean' },
    logLevel:  { enum: ['verbose', 'info', 'warn', 'error'] },
    timeout:   { type: 'number', minimum: 0 },
    retries:   { type: 'number', minimum: 0, maximum: 10 }
  }
};
const validateConfig = ajv.compile(configSchema);

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
  }

  async processConfig(rawConfig, environment = 'development') {
    let parsed;
    try {
      // SECURITY FIX: Use JSON.parse instead of eval() - no code execution
      parsed = JSON.parse(rawConfig);
    } catch (e) {
      throw new Error('Config is not valid JSON: ' + e.message);
    }

    // SECURITY FIX: Validate input against strict schema
    if (!validateConfig(parsed)) {
      throw new Error('Config validation failed: ' +
                      ajv.errorsText(validateConfig.errors));
    }

    // Store the validated config
    this.configs[environment] = {
      ...this.configs[environment],
      ...parsed,
      lastUpdated: new Date().toISOString(),
      processedBy: 'json-validation'
    };

    return {
      configObj: parsed,
      message: 'Configuration processed safely (no eval)'
    };
  }

  async getCurrentConfig(environment) {
    return this.configs[environment] || this.configs.development;
  }

  // SECURITY FIX: Removed executeConfigScript method entirely
  // This method previously allowed arbitrary code execution through eval()
  // Configuration should only accept structured data, not executable code
}

module.exports = new ConfigService();
