const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const cron = require('node-cron')
const { loadEnvConfig } = require('@next/env')

const dev = process.env.NODE_ENV !== 'production'
loadEnvConfig('./', dev)
const hostname = 'localhost'
const port = process.env.PORT || 3000

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      
      // Initialize price fetch every 5 minutes
      console.log("> Initializing cron job for price fetch every 5 minutes")
      cron.schedule('*/5 * * * *', async () => {
        console.log("Running periodic price fetch...")
        try {
          // Make an internal request to the refresh API route
          const fetchRes = await fetch(`http://${hostname}:${port}/api/prices/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add a secret key here for production to prevent unauthorized triggers
              'Authorization': `Bearer CRON_SECRET`
            }
          })
          if (fetchRes.ok) {
             console.log("Successfully updated prices.")
          } else {
             console.log("Failed to update prices.", fetchRes.statusText)
          }
        } catch (error) {
          console.error("Error running cron job:", error)
        }
      })
    })
})
