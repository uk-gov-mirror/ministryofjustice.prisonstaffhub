const express = require('express')
const config = require('./config')

const router = express.Router()

module.exports = () => {
  router.get('/add-bulk-appointments', (req, res) => {
    return res.redirect(301, '/bulk-appointments/need-to-upload-file')
  })

  router.get('/content/support', (req, res) => res.redirect(301, config.app.supportUrl))

  router.get('/offenders/:offenderNo', (req, res) => res.redirect(301, `/prisoner/${req.params.offenderNo}`))

  router.get('/offenders/:offenderNo/adjudications', (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/adjudications`)
  )

  router.get('/offenders/:offenderNo/quick-look', (req, res) => res.redirect(301, `/prisoner/${req.params.offenderNo}`))

  router.get('/api/offenders/:offenderNo/adjudications/:adjudicationNumber', (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/adjudications/${req.params.adjudicationNumber}`)
  )

  router.get(['/offenders/:offenderNo/iep-details', '/offenders/:offenderNo/incentive-level-details'], (req, res) =>
    res.redirect(301, `/prisoner/${req.params.offenderNo}/incentive-level-details`)
  )

  router.get('/videolink', (req, res) => {
    res.redirect(301, config.apis.bookVideoLink.url)
  })

  return router
}
