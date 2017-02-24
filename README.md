# merge-items

Upserts documents (objects) into collections (arrays) by primary key

## Getting started

`npm i -S merge-items`

```js
import mergeItems from 'merge-items';

mergeItems(source, items, options);
```

## Example

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
// => [
//   {id: 1, name: 'FooFoo'},
//   {id: 3, name: 'Baz'},
// ]

source;
// => [
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
const source = [];
const items = [
  {_id: 'abc', name: 'foo'},
  {_id: 'zxc', name: 'bar'},
];

mergeItems(source, items, {
  primaryKey: '_id',
});
```

### mapInsert, mapUpdate, mapUpsert

- `mapInsert(data)` - maps items to be inserted (new items)
- `mapUpdate(data)` - maps items to be updated (existing items)
- `mapUpsert(data, isNew)` - maps all items

```js
class Person {
  constructor(body) {
    Object.assign(this, body);
  }
}

const source = [];
const newPerson = {
  name: 'Bob',
  age: 20,
};

mergeItems(source, newPerson, {
  mapUpsert: (data, isNew) => {
    if (isNew) {
      return new Person(data);
    } else {
      return data;
    }
  },
});
// => Person {
//   name: 'Bob',
//   age: 20,
// }
```

### afterInsert, afterUpdate, afterUpsert

- `afterInsert(item, data)` - invokes after item was inserted (new item)
- `afterUpdate(item, data)` - invokes after item was updated (existing item)
- `afterUpsert(item, data, isNew)` - always invokes

```js
const people = [];

class Person {
  friendsIds = [];

  constructor(body) {
    Object.assign(this, body);
  }

  setFriends(friends) {
    const newPeople = friends.map(f => {
      return {
        id: _.uniqueId(), // lodash function to generate unique ID
        name: f,
      };
    })

    mergeItems(people, newPeople);

    this.friendsIds = newPeople.map(f => f.id);
  }

  getFriends() {
    return people.filter(p => {
      return this.friendsIds.includes(p.id);
    });
  }
}

const newPerson = {
  id: 1,
  name: 'Bob',
  age: 20,
  friends: ['Alice', 'Charlie'],
};

mergeItems(people, newPerson, {
  mapUpsert: (data, isNew) => {
    const {friends, ...body} = data;

    if (isNew) {
      return new Person(body);
    } else {
      return body;
    }
  },
  afterUpsert: (person, data, isNew) => {
    const {friends} = data;

    person.setFriends(friends);
  },
});
// => Person {
//   id: 1,
//   name: 'Bob',
//   age: 20,
//   friendsIds: [<uniqueId>, <uniqueId>]
// }

people;
// => [
//   Person {id: 1, name: 'Bob', age: 20, friendsIds: [<uniqueId>, <uniqueId>]},
//   Person {id: <uniqueId>, name: 'Alice', friendsIds: []},
//   Person {id: <uniqueId>, name: 'Charlie', friendsIds: []},
// ]
```