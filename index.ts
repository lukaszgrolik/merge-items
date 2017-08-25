// import {
//   validateSource,
//   validateOptions,
//   validateItemArg,
// } from './lib/validation';
import upsertItems from './lib/upsert-items';
import {ISourceItem, IArgItem, IOpts} from './lib/interfaces';

export {
  ISourceItem,
  IArgItem,
  IOpts,
}

// function mergeItems(source: ISourceItem[], itemArg: IArgItem[], opts: IOpts): ISourceItem[]
// function mergeItems(source: ISourceItem[], itemArg: IArgItem, opts: IOpts): ISourceItem
// function mergeItems(source: ISourceItem[], itemArg: IArgItem | IArgItem[], opts: IOpts): ISourceItem | ISourceItem[] {
//   validateSource(source);
//   validateOptions(opts);
//   validateItemArg(itemArg, opts);

//   return upsertItems(source, itemArg, opts);
// };

export default upsertItems;