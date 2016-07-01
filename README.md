```js
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
//   updated: [
//     {id: 1, name: 'FooFoo'},
//   ],
//   inserted: [
//     {id: 3, name: 'Baz'},
//   ],
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

type: string
default: 'id'

```js
mergeItems(source, items, {
  primaryKey: '_id',
});
```

### mapper

type: function

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