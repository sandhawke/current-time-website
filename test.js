const test = require('tape')
const my = require('.')
const fetch = require('node-fetch')

test(async (t) => {
  const site = await my.create({ port: 0 })
  const res = await fetch(site.siteurl + '?accept=application/json')
  const data = await res.json()
  t.deepEqual(data, { time: site.lastTimeServed, units: 1 })
  await site.stop()
  t.end()
})

test(async (t) => {
  const site = await my.create({ port: 0 })
  const res = await fetch(site.siteurl)
  const data = parseFloat(await res.text())
  t.deepEqual(data, site.lastTimeServed)
  await site.stop()
  t.end()
})

test(async (t) => {
  const site = await my.create({ port: 0 })
  const res = await fetch(site.siteurl, {
    headers: { accept: 'text/html' }
  })
  const data = await res.text()
  t.ok(data.match(/UNIX/))
  await site.stop()
  t.end()
})
