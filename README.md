# current-time-website
[![NPM version][npm-image]][npm-url]

For testing certain kinds of software, a website that displays the
current time, arbitrary rounded.

## Run your own

```terminal
$ npm i -g current-time-website
...
$ current-time-website &
# server started at http://localhost:3000
$ opn http://localhost:3000
```

## Use mine

Example running at <https://time.hawkeworks.com/>.

Can also do a cycle. Click on this link, then keep refreshing it. It
should change its response every 3 seconds:

* <https://time.hawkeworks.com/?units=3&cycle=red;orange;yellow;green;blue;violet>.

## In test suites

```js
const { create } = require('current-time-website')

...

test(async (t) => {
  const site = await create({
    port: 0,
    offset: Date.now() / 1000,
    units: 0.1,
    cycle: ['a', 'b', 'c']
  })
  let data

  data = await (await fetch(site.siteurl)).text()
  t.equal(data, 'a')
  await delay(100)
  data = await (await fetch(site.siteurl)).text()
  t.equal(data, 'b')

  
  await site.stop()
  t.end()
})

```

[npm-image]: https://img.shields.io/npm/v/current-time-website.svg?style=flat-square
[npm-url]: https://npmjs.org/package/current-time-website
