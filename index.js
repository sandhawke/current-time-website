const querystring = require('querystring')
const AppMgr = require('appmgr')
const H = AppMgr.H

const unix = H.safe('the <small>UNIX</small> epoch')

const defaults = {
  units: 1,
  offset: 0,
  epoch: unix,
  cycle: false
}

async function create (...options) {
  const m = new AppMgr(...options)
  // I'm smushing the options spaces of AppMgr and addRoutes. Seems harmless.
  addRoutes(m, Object.assign({}, defaults, ...options))
  await m.start()
  return m
}

function addRoutes (m, def) {
  m.app.get('/', async (req, res) => {
    const units = parseFloat(req.query.units) || def.units
    const offset = parseFloat(req.query.offset) || def.offset
    const epoch = req.query.epoch || (
      offset ? 'the given offset time' : def.epoch
    )
    const type = req.query.accept
    if (type) req.headers['accept'] = type
    const cycle = req.query.cycle ? req.query.cycle.split(/;/) : def.cycle
    console.log({ cycle })

    const now = (Date.now() / 1000) - offset
    const time = (Math.round(now / units) * units)
    const cleaner = (Math.round(time * 1000) / 1000)
    m.lastTimeServed = cleaner // for easy access by testers
    const text = cleaner

    function link (mods) {
      const args = Object.assign({ units, offset, epoch, type }, mods)
      if (args.offset === 0) delete args.offset
      if (args.units === 1) delete args.units
      if (args.epoch === unix) delete args.epoch
      if (args.type === 'text/html') delete args.type
      return '/?' + querystring.stringify(args)
    }

    if (cycle) {
      const index = Math.max(0, Math.round(time / units)) % cycle.length
      console.log({ time, index, cycle })
      res.send(cycle[index])
      return
    }

    res.format({
      text: function () {
        res.send('' + time)
      },
      json: function () {
        res.send({ time, units })
      },
      html: function () {
        res.send(AppMgr.H`
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      
body { 
  font-family: Arial; 
  margin: 2em;
}

a:link {
    /* text-decoration: inherit; */
    color: inherit;
}

a:visited {
    /* text-decoration: inherit; */
    color: inherit;
}
    </style>
</head>
<body>
<h2>Current Time</h2>

<p>This page displays the current time, rounded to the units you
provide. I wrote it for testing software which notices when pages
change.</p>

<p>At the moment this page was generated, it had been <b>${text}</b>s since ${epoch}, value rounded to the nearest ${units}s.</p>

<form>
<label>Change every (in decimal seconds)</label>
<input type="text" name="units" placeholder="2.5" value="${units}" />
<input type="submit" value="go" />
</form>

<p>Simplified responses for 
<a href="${link({ accept: 'application/json' })}">json</a>
 and 
<a href="${link({ accept: 'text/plain' })}">text/plain</a>
text/plain
 (default).

<a href="https://github.com/sandhawke/current-time-website">Source code.</a>
</p>

<p style="margin-top:10em;">&nbsp</p>
${req.appmgr.footer}
`)
      }
    })
  })
}

module.exports = { create }
