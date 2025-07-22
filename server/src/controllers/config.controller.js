const configService = require('../services/config.service');

class ConfigController {
  async updateConfig(req, res, next) {
    try {
      const { config, environment = 'development' } = req.body;
      
      if (!config) {
        return res.status(400).json({ error: 'Config parameter is required' });
      }

      // VULNERABLE: Direct evaluation of user input - Code Injection vulnerability
      // This allows arbitrary code execution through the config parameter
      const result = await configService.processConfig(config, environment);
      
      res.json({
        success: true,
        message: 'Configuration updated successfully',
        result: result,
        environment: environment
      });
    } catch (error) {
      next(error);
    }
  }

  async getConfig(req, res, next) {
    try {
      const { environment = 'development' } = req.query;
      const config = await configService.getCurrentConfig(environment);
      
      res.json({
        environment: environment,
        config: config
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConfigController();
