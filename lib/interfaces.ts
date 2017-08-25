// export interface ISourceItem {
//   [key: string]: any;
// }

export interface IBodyItem {
  [key: string]: any;
}

export interface IOpts<TSourceItem> {
  primaryKey: keyof TSourceItem;
  mapInsert?: (item: IBodyItem) => TSourceItem;
  mapUpdate?: (item: IBodyItem) => TSourceItem;
  mapUpsert?: (item: IBodyItem, isNew: boolean) => TSourceItem;
  afterInsert?: (item: TSourceItem, data: IBodyItem) => void;
  afterUpdate?: (item: TSourceItem, data: IBodyItem) => void;
  afterUpsert?: (item: TSourceItem, data: IBodyItem, isNew: boolean) => void;
}