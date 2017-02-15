import lodashFind from 'lodash/find';
import lodashMap from 'lodash/map';
import lodashExtend from 'lodash/extend';
import lodashEach from 'lodash/each';

export default (source, itemArg, opts) => {
  const sourceItemsIds = lodashMap(source, opts.primaryKey);
  const items = (itemArg instanceof Array) ? itemArg : [itemArg];
  const insertedItems = [];
  const updatedItemsIds = [];
  let record;

  if (typeof opts.beforeMerge === 'function') {
    lodashEach(items, (item, i) => {
      const isNew = !lodashFind(sourceItemsIds, id => {
        return id == item[opts.primaryKey];
      });

      items[i] = opts.beforeMerge(item, isNew);
    });
  }

  lodashEach(items, item => {
    record = lodashFind(source, sourceItem => {
      return sourceItem[opts.primaryKey] == item[opts.primaryKey];
    });

    if (record) {
      // update existing items
      lodashExtend(record, {...item});

      updatedItemsIds.push(record[opts.primaryKey])
    } else {
      // collect new items
      insertedItems.push({...item});
    }
  });

  const newInstances = opts.mapper ? lodashMap(insertedItems, opts.mapper) : insertedItems;

  // insert new items
  [].push.apply(source, newInstances);

  const mergedItems = lodashMap(items, item => {
    return lodashFind(source, {[opts.primaryKey]: item[opts.primaryKey]});
  });

  if (typeof opts.afterMerge === 'function') {
    lodashEach(mergedItems, item => {
      const data = lodashFind(items, {[opts.primaryKey]: item[opts.primaryKey]});
      const isNew = !lodashFind(sourceItemsIds, id => {
        return id == item[opts.primaryKey];
      });

      opts.afterMerge(item, data, isNew);
    });
  }

  return {
    inserted: lodashMap(insertedItems, item => item[opts.primaryKey]),
    updated: updatedItemsIds,
    merged: mergedItems,
  };
};