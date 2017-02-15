import {
  validateSource,
  validateOptions,
  validateItemArg,
} from './lib/validation';
import upsertItems from './lib/upsert-items';

export default function mergeItems(source, itemArg, opts = {}) {
  validateSource(source);
  validateOptions(opts);
  validateItemArg(itemArg, opts);

  return upsertItems(source, itemArg, opts);
};