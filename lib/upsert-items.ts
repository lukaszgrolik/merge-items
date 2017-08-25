import lodashFind = require('lodash/find');
import lodashMap = require('lodash/map');
import lodashExtend = require('lodash/extend');
import lodashEach = require('lodash/each');
import lodashCloneDeep = require('lodash/cloneDeep');

import {IBodyItem, IOpts} from './interfaces';

const _ = {
  find: lodashFind,
  map: lodashMap,
  extend: lodashExtend,
  each: lodashEach,
  cloneDeep: lodashCloneDeep,
};

function upsertItems<TSourceItem> (source: TSourceItem[], itemArg: IBodyItem[], opts: IOpts<TSourceItem>): TSourceItem[]
function upsertItems<TSourceItem> (source: TSourceItem[], itemArg: IBodyItem, opts: IOpts<TSourceItem>): TSourceItem
function upsertItems<TSourceItem> (source: TSourceItem[], itemArg: IBodyItem | IBodyItem[], opts: IOpts<TSourceItem>): TSourceItem | TSourceItem[] {
  const sourceItemsIds = _.map(source, opts.primaryKey);
  const items = (itemArg instanceof Array) ? itemArg : [itemArg];
  const itemsClone = _.cloneDeep(items);
  const insertedItems: IBodyItem[] = [];
  const updatedItems: IBodyItem[] = [];
  let record;

  if (typeof opts.mapInsert === 'function' ||
      typeof opts.mapUpdate === 'function' ||
      typeof opts.mapUpsert === 'function') {
    _.each(items, (item, i) => {
      const isNew = !_.find(sourceItemsIds, id => {
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

  _.each(items, item => {
    record = _.find(source, sourceItem => {
      return sourceItem[opts.primaryKey] == item[opts.primaryKey];
    });

    if (record) {
      // update existing items
      _.extend(record, item);

      updatedItems.push(record)
    } else {
      // collect new items
      insertedItems.push(item);
    }
  });

  // insert new items
  [].push.apply(source, insertedItems);

  const allUpsertedItems = _.map(items, item => {
    // return _.find(source, {[opts.primaryKey]: item[opts.primaryKey]});
    return _.find(source, sourceItem => {
      return sourceItem[opts.primaryKey] === item[opts.primaryKey];
    });
  });
  // remove undefined values (TS check)
  const upsertedItems = allUpsertedItems.filter(item => item) as TSourceItem[];

  if (typeof opts.afterInsert === 'function' ||
      typeof opts.afterUpdate === 'function' ||
      typeof opts.afterUpsert === 'function') {
    _.each(upsertedItems, item => {
      const data = _.find(itemsClone, {[opts.primaryKey]: item[opts.primaryKey]});

      if (!data) return;

      const isNew = !_.find(sourceItemsIds, id => {
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
    return upsertedItems[0];
  }
};

export default upsertItems;