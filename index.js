const _ = require('lodash');

function isObject(arg) {
  return arg instanceof Object && arg instanceof Array === false;
}

module.exports = function mergeItems(source, itemArg, opts) {
  if (opts === undefined) opts = {};

  // [step] validate source

  if (source instanceof Array === false) {
    throw new Error('source must be an array, ' + source + ' given');
  }

  if (itemArg instanceof Object === false) {
    throw new Error('itemArg must be either object or array, ' + itemArg + ' given');
  }

  // [step] validate options

  if (!isObject(opts)) {
    throw new Error('options must be an object, ' + opts + ' given');
  }

  if (opts.primaryKey === undefined) opts.primaryKey = 'id';

  if (opts.hasOwnProperty('mapper') && typeof opts.mapper !== 'function') {
    throw new Error('mapper must be a function, ' + opts.mapper + ' given');
  }

  if (typeof opts.primaryKey !== 'string' || opts.primaryKey.length === 0) {
    throw new Error('primaryKey must be a string, ' + opts.primaryKey + ' given');
  }

  // [step] validate itemArg

  if (isObject(itemArg) && itemArg.hasOwnProperty(opts.primaryKey) === false) {
    throw new Error('primary key "' + opts.primaryKey + '" is missing in itemArg ' + JSON.stringify(itemArg));
  }

  if (itemArg instanceof Array) {
    _.each(itemArg, item => {
      if (!isObject(item)) {
        throw new Error('itemArg contains non-object: ' + item);
      }

      if (item.hasOwnProperty(opts.primaryKey) === false) {
        throw new Error('primary key "' + opts.primaryKey + '" is missing in object ' + JSON.stringify(item));
      }

      // look for primaryKey duplicates
      _.each(itemArg, item2 => {
        if (itemArg.indexOf(item) !== itemArg.indexOf(item2) &&
            item[opts.primaryKey] === item2[opts.primaryKey]) {
          throw new Error('primary key "' + opts.primaryKey + '" in object ' + JSON.stringify(item2) + ' is not unique');
        }
      });
    });
  }

  // [step] upsert items

  const items = (itemArg instanceof Array) ? itemArg : [itemArg];
  const insertedItems = [];
  const updatedItems = [];
  let record;

  _.each(items, item => {
    record = _.find(source, record => record[opts.primaryKey] == item[opts.primaryKey]);

    if (record) {
      // update existing items
      _.extend(record, item);

      updatedItems.push(record)
    } else {
      // collect new items
      insertedItems.push(item);
    }
  });

  const newInstances = opts.mapper ? _.map(insertedItems, opts.mapper) : insertedItems;

  // insert new items
  [].push.apply(source, newInstances);

  return {
    inserted: insertedItems,
    updated: updatedItems,
  };
};