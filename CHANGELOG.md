# 0.2.0

## Breaking changes

- changed return value - now it returns upserted item(s)
- deleted `mapper` option - use `mapInsert` option instead

## New features

- added object lifetime callbacks supported in `options`
  - mapInsert(data)
  - mapUpdate(data)
  - mapUpsert(data, isNew)
  - afterInsert(item, data)
  - afterUpdate(item, data)
  - afterUpsert(item, data, isNew)

## Other

- "main" field in package.json now points to unminified version of distributable script
- Updated README.md