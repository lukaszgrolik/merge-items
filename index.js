'use strict';

const _ = require('lodash');

function isObject(arg) {
  return arg instanceof Object && arg instanceof Array === false;
}

module.exports = function mergeItems(source, arg, opts) {
  if (opts === undefined) opts = {};

  // [step] validate source

  if (source instanceof Array === false) throw new Error('source must be an array, ' + source + ' given');
  if (arg instanceof Object === false) throw new Error('arg must be either object or array, ' + arg + ' given');

  // [step] validate options

  if (!isObject(opts)) throw new Error('options must be an object, ' + opts + ' given');

  if (opts.primaryKey === undefined) opts.primaryKey = 'id';

  if (opts.hasOwnProperty('mapper') && typeof opts.mapper !== 'function') throw new Error('mapper must be a function, ' + opts.mapper + ' given');
  if (typeof opts.primaryKey !== 'string' || opts.primaryKey.length === 0) throw new Error('primaryKey must be a string, ' + opts.primaryKey + ' given');

  // [step] validate arg

  if (isObject(arg) && arg.hasOwnProperty(opts.primaryKey) === false) {
    throw new Error('primary key "' + opts.primaryKey + '" is missing in arg ' + JSON.stringify(arg));
  }

  if (arg instanceof Array) {
    _.each(arg, item => {
      if (!isObject(item)) {
        throw new Error('arg contains non-object: ' + item);
      }

      if (item.hasOwnProperty(opts.primaryKey) === false) {
        throw new Error('primary key "' + opts.primaryKey + '" is missing in object ' + JSON.stringify(item));
      }

      // look for primaryKey duplicates
      _.each(arg, item2 => {
        if (arg.indexOf(item) !== arg.indexOf(item2) &&
            item[opts.primaryKey] === item2[opts.primaryKey]) {
          throw new Error('primary key "' + opts.primaryKey + '" in object ' + JSON.stringify(item2) + ' is not unique');
        }
      });
    });
  }

  // [step] upsert items

  const items = (arg instanceof Array) ? arg : [arg];
  const newItems = [];
  const updatedItemsIds = [];
  let record;

  _.each(items, item => {
    record = _.find(source, record => record[opts.primaryKey] == item[opts.primaryKey]);

    if (record) {
      // update existing items
      _.extend(record, item);

      updatedItemsIds.push(record.id)
    } else {
      // collect new items
      newItems.push(item);
    }
  });

  const newInstances = opts.mapper ? newItems.map(opts.mapper) : newItems;

  // insert new items
  [].push.apply(source, newInstances);

  return {
    inserted: _.map(newItems, 'id'),
    updated: updatedItemsIds,
  };
};