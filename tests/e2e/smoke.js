const { Builder } = require('selenium-webdriver');

(async () => {
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://example.com');
    console.log('Page title:', await driver.getTitle());
  } finally {
    await driver.quit();
  }
})();
