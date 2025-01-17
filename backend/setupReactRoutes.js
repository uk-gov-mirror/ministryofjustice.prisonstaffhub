const express = require('express')
const path = require('path')

const router = express.Router()

const setup = () => {
  // These are routes defined in the react router
  // They are listed here so the express app also knows about
  // them and knows to pass them onto the react router
  // This is needed in order to implement a page not found behaviour.
  router.get('/manage-prisoner-whereabouts*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
  })

  router.get('/iep-slip', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
  })

  return router
}

module.exports = dependencies => setup(dependencies)
