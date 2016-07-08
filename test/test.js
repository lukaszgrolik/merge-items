const should = require('should');
const mergeItems = require('../dist/merge-items' + (process.env.NODE_ENV === 'production' ? '.min' : ''));

function Person(body) {
  Object.assign(this, body);
}

it('merges item', () => {
  const source = [
    {id: 1, name: 'a'},
    {id: 2, name: 'b'},
  ];

  mergeItems(source, {id: 1, name: 'aaa'});
  mergeItems(source, {id: 3, name: 'c'});

  source.should.have.length(3);
  source.should.containDeepOrdered([
    {id: 1, name: 'aaa'},
    {id: 2, name: 'b'},
    {id: 3, name: 'c'},
  ]);
});

it('merges array of items', () => {
  const source = [
    {id: 1, name: 'a'},
    {id: 2, name: 'b'},
  ];
  const newItems = [
    {id: 1, name: 'aaa'},
    {id: 3, name: 'c'},
  ];

  mergeItems(source, newItems);

  source.should.have.length(3);
  source.should.containDeepOrdered([
    {id: 1, name: 'aaa'},
    {id: 2, name: 'b'},
    {id: 3, name: 'c'},
  ]);
});

it('merges items using custom mapper', () => {
  const source = [];

  mergeItems(source, [{id: 1}], {
    mapper: item => new Person(item),
  });

  source[0].should.be.instanceof(Person);
  source[0].should.have.property('id', 1);
});

it('merges items using custom primaryKey', () => {
  const source = [{x: 1}, {x: 2}];

  mergeItems(source, [{x: 2}, {x: 3}], {
    primaryKey: 'x',
  });

  source.should.containDeepOrdered([
    {x: 1},
    {x: 2},
    {x: 3},
  ]);
});

it('returns object with inserted and updated items IDs', () => {
  const source = [
    {id: 1, name: 'a'},
    {id: 2, name: 'b'},
  ];
  const newItems = [
    {id: 1, name: 'aaa'},
    {id: 2, name: 'bbb'},
    {id: 3, name: 'c'},
    {id: 4, name: 'd'},
  ];

  const result = mergeItems(source, newItems);

  result.should.be.instanceof(Object);
  Object.keys(result).should.have.length(2);
  result.should.containDeepOrdered({
    inserted: [3, 4],
    updated: [1, 2],
  });
});

describe('source', () => {
  it('throws if source is not an array', () => {
    const args = [undefined, null, 0, 1, '', 'abc', {}];

    args.forEach(arg => {
      (() => mergeItems(arg)).should.throw('source must be an array, ' + arg + ' given');
    });
  });
});

describe('itemArg', () => {
  it('throws if itemArg is neither object nor array', () => {
    const args = [undefined, null, 0, 1, '', 'abc'];

    args.forEach(arg => {
      (() => mergeItems([], arg)).should.throw('itemArg must be either object or array, ' + arg + ' given');
    });

    // should not throw
    mergeItems([], new Person({id: 1}));
  });

  it('throws if itemArg is an object without primaryKey', () => {
    (() => mergeItems([], {x: 1})).should.throw('primary key "id" is missing in itemArg {"x":1}');
  });

  it('throws if itemArg is an array containing non-object', () => {
    const args = [undefined, null, 0, 1, '', 'abc', []];

    args.forEach(arg => {
      (() => mergeItems([], [arg])).should.throw('itemArg contains non-object: ' + arg);
    });

    // should not throw
    mergeItems([], [new Person({id: 1})]);
  });

  it('throws if itemArg is an array containing object without primaryKey', () => {
    const arg = [{id: 1}, {x: 1}];

    (() => mergeItems([], arg)).should.throw('primary key "id" is missing in object {"x":1}');
  });

  it('throws if itemArg is an array containing objects with the same primaryKey', () => {
    const arg = [{id: 1}, {id: 2, a: 1}, {id: 2, a: 2}];

    (() => mergeItems([], arg)).should.throw('primary key "id" in object {"id":2,"a":2} is not unique');
  });
});

describe('options', () => {
  it('throws if options is not an object', () => {
    const args = [null, 0, 1, '', 'abc', []];

    args.forEach(arg => {
      (() => mergeItems([], [], arg)).should.throw('options must be an object, ' + arg + ' given');
    });
  });

  it('throws if mapper is given but is not a function', () => {
    const args = [undefined, null, 0, 1, '', 'abc', {}, []];

    args.forEach(arg => {
      (() => mergeItems([], [], {mapper: arg})).should.throw('mapper must be a function, ' + arg + ' given');
    });
  });

  it('throws if primaryKey is not a string', () => {
    const args = [null, 0, 1, '', {}, []];

    args.forEach(arg => {
      (() => mergeItems([], [], {primaryKey: arg})).should.throw('primaryKey must be a string, ' + arg + ' given');
    });
  });
});