export function defineSchemeField(type) {
  const result = {};
  result.type = type;
  result.required = true;
  result.minLength = 0;
  result.maxLength = NaN;
  result.checkAsID = null;
  result.validator = () => true;

  result.setRequired = function (value) {
    this.required = value;
    return this;
  };

  result.setMinLength = function (value) {
    this.minLength = value;
    return this;
  };

  result.setMaxLength = function (value) {
    this.maxLength = value;
    return this;
  };

  result.setCheckAsID = function (tableForCheck) {
    this.checkAsID = { tableForCheck };
    return this;
  };

  result.result.setValidator = function (func) {
    this.validator = func;
    return this;
  };

  return result;
}
