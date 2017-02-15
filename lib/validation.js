import lodashEach from 'lodash/each';

const isObject = arg => {
  return arg instanceof Object && arg instanceof Array === false;
};

export const validateSource = (source) => {
  if (source instanceof Array === false) {
    throw new Error(`source must be an array, ${source} given`);
  }
};

export const validateOptions = opts => {
  if (!isObject(opts)) {
    throw new Error(`options must be an object, ${opts} given`);
  }

  if (opts.primaryKey === undefined) opts.primaryKey = 'id';

  if (opts.hasOwnProperty('mapper') && typeof opts.mapper !== 'function') {
    throw new Error(`mapper must be a function, ${opts.mapper} given`);
  }

  if (typeof opts.primaryKey !== 'string' || opts.primaryKey.length === 0) {
    throw new Error(`primaryKey must be a string, ${opts.primaryKey} given`);
  }
};

export const validateItemArg = (itemArg, opts) => {
  if (itemArg instanceof Object === false) {
    throw new Error(`itemArg must be either object or array, ${itemArg} given`);
  }

  if (isObject(itemArg) && itemArg.hasOwnProperty(opts.primaryKey) === false) {
    throw new Error(`primary key "${opts.primaryKey}" is missing in itemArg ${JSON.stringify(itemArg)}`);
  }

  if (itemArg instanceof Array) {
    lodashEach(itemArg, item => {
      if (!isObject(item)) {
        throw new Error(`itemArg contains non-object: ${item}`);
      }

      if (item.hasOwnProperty(opts.primaryKey) === false) {
        throw new Error(`primary key "${opts.primaryKey}" is missing in object ${JSON.stringify(item)}`);
      }

      // look for primaryKey duplicates
      lodashEach(itemArg, item2 => {
        if (itemArg.indexOf(item) !== itemArg.indexOf(item2) &&
            item[opts.primaryKey] === item2[opts.primaryKey]) {
          throw new Error(`primary key "${opts.primaryKey}" in object ${JSON.stringify(item2)} is not unique`);
        }
      });
    });
  }
};