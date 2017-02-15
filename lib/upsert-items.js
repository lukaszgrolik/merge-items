import lodashFind from 'lodash/find';
import lodashMap from 'lodash/map';
import lodashExtend from 'lodash/extend';
import lodashEach from 'lodash/each';

export default (source, itemArg, opts) => {
  const items = (itemArg instanceof Array) ? itemArg : [itemArg];
  const insertedItems = [];
  const updatedItemsIds = [];
  let record;

  lodashEach(items, item => {
    record = lodashFind(source, record => record[opts.primaryKey] == item[opts.primaryKey]);

    if (record) {
      // update existing items
      lodashExtend(record, item);

      updatedItemsIds.push(record[opts.primaryKey])
    } else {
      // collect new items
      insertedItems.push(item);
    }
  });

  const newInstances = opts.mapper ? lodashMap(insertedItems, opts.mapper) : insertedItems;

  // insert new items
  [].push.apply(source, newInstances);

  return {
    inserted: lodashMap(insertedItems, item => item[opts.primaryKey]),
    updated: updatedItemsIds,
    merged: lodashMap(items, item => {
      return lodashFind(source, {[opts.primaryKey]: item[opts.primaryKey]});
    }),
  };
};