# merge-items

Upserts documents (objects) into collections (arrays) by primary key

```js
import mergeItems from 'merge-items';

const source = [
  {id: 1, name: 'Foo'},
  {id: 2, name: 'Bar'},
];
const items = [
  {id: 1, name: 'FooFoo'},
  {id: 3, name: 'Baz'},
];

mergeItems(source, items);
// =>
// {
//   updated: [1],
//   inserted: [3],
// }

source;
// =>
// [
//   {id: 1, name: 'FooFoo'},
//   {id: 2, name: 'Bar'},
//   {id: 3, name: 'Baz'},
// ]
```

## Options

### primaryKey

- type: *string*
- default: `id`

```js
mergeItems(source, items, {
  primaryKey: '_id',
});
```

### beforeMerge

### afterMerge

### mapper (deprecated)

Transforms given objects before inserting (only new items).

- type: *function*

```js
class Person {
  constructor(body) {
    Object.assign(this, body);
  }
}

mergeItems(source, items, {
  mapper: item => new Person(item),
});
```

This callback is deprecated - use `beforeMerge(item, data, isNew)` when `isNew` is `true`:

```js
class Person {
  constructor(body) {
    Object.assign(this, body);
  }
}

mergeItems(source, items, {
  beforeMerge: (data, isNew) => {
    if (isNew) {
      return new Person(data);
    } else {
      return data;
    }
  },
});
```