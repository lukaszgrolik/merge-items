import * as should from 'should';
import mergeItems from '../index';

describe('upserting', () => {
  it('upserts single item', () => {
    const source = [
      {id: 1, name: 'a'},
      {id: 2, name: 'b'},
    ];

    mergeItems(source, {id: 1, name: 'aaa'}, {primaryKey: 'id'});
    mergeItems(source, {id: 3, name: 'c'}, {primaryKey: 'id'});

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

    mergeItems(source, newItems, {primaryKey: 'id'});

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
    // updating
    const res1 = mergeItems(source, {id: 1, name: 'aaa'}, {primaryKey: 'id'});

    res1.should.be.instanceof(Object);
    res1.should.have.eql({id: 1, name: 'aaa'});

    // inserting
    const res2 = mergeItems(source, {id: 3, name: 'ccc'}, {primaryKey: 'id'});

    res2.should.be.instanceof(Object);
    res2.should.have.eql({id: 3, name: 'ccc'});
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

    const result = mergeItems(source, newItems, {primaryKey: 'id'});

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
      primaryKey: 'id',
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
      primaryKey: 'id',
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
      primaryKey: 'id',
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
      primaryKey: 'id',
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

  it('passes original data param in afterInsert', () => {
    const source: {}[] = [];

    class Person {
      id: number;
      a: number;

      constructor(body: {id: number; a: number}) {
        this.id = body.id;
        this.a = body.a * 5;
      }
    }

    mergeItems(source, [{id: 1, a: 3}], {
      primaryKey: 'id',
      mapInsert: data => new Person(data),
      afterInsert: (obj, data, isNew) => {
        obj.x = data.a;
      },
    });

    source[0].should.have.properties({id: 1, a: 15, x: 3});
    Object.keys(source[0]).should.have.length(3);
  });
});

describe('"afterUpdate" option', () => {
  it('calls afterUpdate callback', () => {
    const source = [{id: 1}, {id: 2}];

    mergeItems(source, [{id: 1, a: 5}, {id: 3, a: 1}], {
      primaryKey: 'id',
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

  it('passes original data param in afterUpdate', () => {
    const source = [{id: 1, a: 3}];
    const item = {id: 1, a: 5};

    mergeItems(source, [item], {
      primaryKey: 'id',
      afterUpdate: (obj, data, isNew) => {
        item.a = 123;
        obj.x = data.a;
      },
    });

    source.should.eql([
      {id: 1, a: 5, x: 5},
    ]);
  });
});

describe('"afterUpsert" option', () => {
  it('calls afterUpsert callback', () => {
    const source = [{id: 1}, {id: 2}];

    mergeItems(source, [{id: 1, a: 5}, {id: 3, a: 1}], {
      primaryKey: 'id',
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

  it('passes original data param in afterUpsert', () => {
    const source: {}[] = [];

    class Person {
      id: number;
      a: number;

      constructor(body: {id: number; a: number}) {
        this.id = body.id;
        this.a = body.a * 5;
      }
    }

    mergeItems(source, [{id: 1, a: 3}], {
      primaryKey: 'id',
      mapInsert: data => new Person(data),
      afterUpsert: (obj, data, isNew) => {
        obj.x = data.a;
      },
    });

    source[0].should.have.properties({id: 1, a: 15, x: 3});
    Object.keys(source[0]).should.have.length(3);
  });
});