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

  async processConfig(configString, environment) {
    try {
      // CRITICAL VULNERABILITY: Using eval() with unsanitized user input
      // This allows Remote Code Execution (RCE) through arbitrary JavaScript execution
      console.log(`Processing config for environment: ${environment}`);
      console.log(`Config input: ${configString}`);
      
      // Multiple vulnerable patterns for comprehensive detection:
      
      // 1. Direct eval() - Most dangerous
      const evalResult = eval(configString);
      
      // 2. Function constructor - Also dangerous
      const dynamicFunction = new Function('return ' + configString);
      const funcResult = dynamicFunction();
      
      // 3. Dynamic property access without sanitization
      const configObj = eval('(' + configString + ')');
      
      // Store the "processed" config
      this.configs[environment] = {
        ...this.configs[environment],
        ...configObj,
        lastUpdated: new Date().toISOString(),
        processedBy: 'eval'
      };

      return {
        evalResult: evalResult,
        funcResult: funcResult,
        configObj: configObj,
        message: 'Configuration processed using dynamic evaluation'
      };
    } catch (error) {
      // Even error handling exposes the vulnerability
      console.error('Config processing error:', error.message);
      throw new Error(`Configuration processing failed: ${error.message}`);
    }
  }

  async getCurrentConfig(environment) {
    return this.configs[environment] || this.configs.development;
  }

  // Additional vulnerable method for demonstration
  async executeConfigScript(script, context = {}) {
    // VULNERABLE: Another eval() usage pattern
    const contextString = JSON.stringify(context);
    const fullScript = `
      const context = ${contextString};
      ${script}
    `;
    
    return eval(fullScript);
  }
}

module.exports = new ConfigService();
