module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        if (rule.oneOf) {
          rule.oneOf = rule.oneOf.map((oneOfRule) => {
            if (
              oneOfRule.test &&
              oneOfRule.test.toString().includes('js|mjs|jsx|ts|tsx')
            ) {
              return {
                ...oneOfRule,
                resolve: {
                  ...oneOfRule.resolve,
                  fullySpecified: false,
                },
              };
            }
            return oneOfRule;
          });
        }
        return rule;
      });
      return webpackConfig;
    },
  },
};
