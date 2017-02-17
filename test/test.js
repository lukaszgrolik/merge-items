const should = require('should');
const mergeItems = require('../dist/merge-items' + (process.env.NODE_ENV === 'production' ? '.min' : ''));

function Person(body) {
  Object.assign(this, body);
}

describe('"source" arg', () => {
  it('throws if source is not an array', () => {
    const args = [undefined, null, 0, 1, '', 'abc', {}];

    args.forEach(arg => {
      (() => mergeItems(arg)).should.throw('source must be an array, ' + arg + ' given');
    });
  });
});

describe('"itemArg" arg', () => {
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

describe('"options" arg', () => {
  it('throws if options is not an object', () => {
    const args = [null, 0, 1, '', 'abc', []];

    args.forEach(arg => {
      (() => mergeItems([], [], arg)).should.throw('options must be an object, ' + arg + ' given');
    });
  });

  // it('throws if mapper is given but is not a function', () => {
  //   const args = [undefined, null, 0, 1, '', 'abc', {}, []];

  //   args.forEach(arg => {
  //     (() => mergeItems([], [], {mapper: arg})).should.throw('mapper must be a function, ' + arg + ' given');
  //   });
  // });

  it('throws if primaryKey is not a string', () => {
    const args = [null, 0, 1, '', {}, []];

    args.forEach(arg => {
      (() => mergeItems([], [], {primaryKey: arg})).should.throw('primaryKey must be a string, ' + arg + ' given');
    });
  });
});

describe('upserting', () => {
  it('upserts single item', () => {
    const source = [
      {id: 1, name: 'a'},
      {id: 2, name: 'b'},
    ];

    mergeItems(source, {id: 1, name: 'aaa'});
    mergeItems(source, {id: 3, name: 'c'});

    source.should.have.length(3);
    source.should.eql([
      {id: 1, name: 'aaa'},
      {id: 2, name: 'b'},
      {id: 3, name: 'c'},
    ]);
  });

  it('upserts array of items', () => {
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
    source.should.eql([
      {id: 1, name: 'aaa'},
      {id: 2, name: 'b'},
      {id: 3, name: 'c'},
    ]);
  });
});

describe('return value', () => {
  it('returns upserted item if single item given', () => {
    const source = [
      {id: 1, name: 'a'},
      {id: 2, name: 'b'},
      {id: 5, name: 'e'},
    ];
    const result = mergeItems(source, {id: 1, name: 'aaa'});

    result.should.be.instanceof(Object);
    result.should.have.eql({id: 1, name: 'aaa'});
  });

  it('returns array of upserted items if array of items given', () => {
    const source = [
      {id: 1, name: 'a'},
      {id: 2, name: 'b'},
      {id: 5, name: 'e'},
    ];
    const newItems = [
      {id: 1, name: 'aaa'},
      {id: 2, name: 'bbb'},
      {id: 3, name: 'c'},
      {id: 4, name: 'd'},
    ];

    const result = mergeItems(source, newItems);

    result.should.be.instanceof(Array);
    result.should.have.eql([
      {id: 1, name: 'aaa'},
      {id: 2, name: 'bbb'},
      {id: 3, name: 'c'},
      {id: 4, name: 'd'},
    ]);
  });
});

describe('"primaryKey" option', () => {
  it('upserts items using custom primaryKey', () => {
    const source = [{x: 1}, {x: 2}];

    mergeItems(source, [{x: 2}, {x: 3}], {
      primaryKey: 'x',
    });

    source.should.eql([
      {x: 1},
      {x: 2},
      {x: 3},
    ]);
  });
});

// describe('"mapper" option', () => {
//   it('upserts items using custom mapper', () => {
//     const source = [];

//     mergeItems(source, [{id: 1}], {
//       mapper: item => new Person(item),
//     });

//     source[0].should.be.instanceof(Person);
//     source[0].should.have.property('id', 1);
//   });
// });

describe('"mapInsert" option', () => {
  it('maps items before insert', () => {
    const source = [{id: 1}, {id: 2}];

    mergeItems(source, [{id: 1}, {id: 3}], {
      mapInsert: data => {
        return Object.assign({}, data, {
          a: 5,
        });
      },
    });

    source.should.have.eql([
      {id: 1},
      {id: 2},
      {id: 3, a: 5},
    ]);
  });
});

describe('"mapUpdate" option', () => {
  it('maps items before update', () => {
    const source = [{id: 1}, {id: 2}];

    mergeItems(source, [{id: 1}, {id: 3}], {
      mapUpdate: data => {
        return Object.assign({}, data, {
          a: 5,
        });
      },
    });

    source.should.have.eql([
      {id: 1, a: 5},
      {id: 2},
      {id: 3},
    ]);
  });
});

describe('"mapUpsert" option', () => {
  it('maps items before upsert', () => {
    const source = [{id: 1}, {id: 2}];

    mergeItems(source, [{id: 1}, {id: 3}], {
      mapUpsert: (data, isNew) => {
        return Object.assign({}, data, {
          a: 5,
          isNew,
        });
      },
    });

    source.should.have.eql([
      {id: 1, a: 5, isNew: false},
      {id: 2},
      {id: 3, a: 5, isNew: true},
    ]);
  });
});

describe('"afterInsert" option', () => {
  it('calls afterInsert callback', () => {
    const source = [{id: 1}, {id: 2}];

    mergeItems(source, [{id: 1, a: 5}, {id: 3, a: 1}], {
      afterInsert: (obj, data) => {
        obj.x = data.a * 3;
      },
    });

    source.should.have.eql([
      {id: 1, a: 5},
      {id: 2},
      {id: 3, a: 1, x: 3},
    ]);
  });
});

describe('"afterUpdate" option', () => {
  it('calls afterUpdate callback', () => {
    const source = [{id: 1}, {id: 2}];

    mergeItems(source, [{id: 1, a: 5}, {id: 3, a: 1}], {
      afterUpdate: (obj, data) => {
        obj.x = data.a * 3;
      },
    });

    source.should.have.eql([
      {id: 1, a: 5, x: 15},
      {id: 2},
      {id: 3, a: 1},
    ]);
  });
});

describe('"afterUpsert" option', () => {
  it('calls afterUpsert callback', () => {
    const source = [{id: 1}, {id: 2}];

    mergeItems(source, [{id: 1, a: 5}, {id: 3, a: 1}], {
      afterUpsert: (obj, data, isNew) => {
        obj.x = data.a * 3;
        obj.isNew = isNew;
      },
    });

    source.should.have.eql([
      {id: 1, a: 5, x: 15, isNew: false},
      {id: 2},
      {id: 3, a: 1, x: 3, isNew: true},
    ]);
  });
});