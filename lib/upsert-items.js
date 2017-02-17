import lodashFind from 'lodash/find';
import lodashMap from 'lodash/map';
import lodashExtend from 'lodash/extend';
import lodashEach from 'lodash/each';

export default (source, itemArg, opts) => {
  const sourceItemsIds = lodashMap(source, opts.primaryKey);
  const items = (itemArg instanceof Array) ? itemArg : [itemArg];
  const insertedItems = [];
  const updatedItems = [];
  let record;

  if (typeof opts.mapInsert === 'function' ||
      typeof opts.mapUpdate === 'function' ||
      typeof opts.mapUpsert === 'function') {
    lodashEach(items, (item, i) => {
      const isNew = !lodashFind(sourceItemsIds, id => {
        return id == item[opts.primaryKey];
      });

      if (isNew && typeof opts.mapInsert === 'function') {
        items[i] = opts.mapInsert(item);
      }

      if (!isNew && typeof opts.mapUpdate === 'function') {
        items[i] = opts.mapUpdate(item);
      }

      if (typeof opts.mapUpsert === 'function') {
        items[i] = opts.mapUpsert(item, isNew);
      }
    });
  }

  lodashEach(items, item => {
    record = lodashFind(source, sourceItem => {
      return sourceItem[opts.primaryKey] == item[opts.primaryKey];
    });

    if (record) {
      // update existing items
      lodashExtend(record, item);

      updatedItems.push(record)
    } else {
      // collect new items
      insertedItems.push(item);
    }
  });

  // insert new items
  [].push.apply(source, insertedItems);

  const upsertedItems = lodashMap(items, item => {
    return lodashFind(source, {[opts.primaryKey]: item[opts.primaryKey]});
  });

  if (typeof opts.afterInsert === 'function' ||
      typeof opts.afterUpdate === 'function' ||
      typeof opts.afterUpsert === 'function') {
    lodashEach(upsertedItems, item => {
      const data = lodashFind(items, {[opts.primaryKey]: item[opts.primaryKey]});
      const isNew = !lodashFind(sourceItemsIds, id => {
        return id == item[opts.primaryKey];
      });

      if (isNew && typeof opts.afterInsert === 'function') {
        opts.afterInsert(item, data);
      }

      if (!isNew && typeof opts.afterUpdate === 'function') {
        opts.afterUpdate(item, data);
      }

      if (typeof opts.afterUpsert === 'function') {
        opts.afterUpsert(item, data, isNew);
      }
    });
  }

  if (itemArg instanceof Array) {
    return upsertedItems;
  } else {
    return updatedItems[0];
  }
};