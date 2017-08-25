import * as _ from 'lodash';

import {IBodyItem, IOpts} from './lib/interfaces';

type id = number | string;
type objAny = {[key: string]: any};

// declare function mergeItems<TSourceItem>(): ;

declare function mergeItems<TSourceItem> (source: TSourceItem[], itemArg: IBodyItem[], opts: IOpts<TSourceItem>): TSourceItem[]
declare function mergeItems<TSourceItem> (source: TSourceItem[], itemArg: IBodyItem, opts: IOpts<TSourceItem>): TSourceItem
declare function mergeItems<TSourceItem> (source: TSourceItem[], itemArg: IBodyItem | IBodyItem[], opts: IOpts<TSourceItem>): TSourceItem | TSourceItem[]

export = mergeItems;