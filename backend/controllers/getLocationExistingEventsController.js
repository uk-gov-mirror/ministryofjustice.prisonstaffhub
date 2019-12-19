const existingEventsService = require('./existingEventsService')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { activeCaseLoadId: agencyId } = req.session.userDetails
  const { date, locationId } = req.query

  try {
    const [locationDetails, events] = await Promise.all([
      elite2Api.getLocation(res.locals, locationId),
      existingEventsService(elite2Api).getExistingEventsForLocation(res.locals, agencyId, locationId, date),
    ])

    return res.render('components/scheduledEvents/scheduledEvents.njk', {
      events,
      name: locationDetails.userDescription,
      type: 'location',
    })
  } catch (error) {
    const errorMessage = 'Error retrieving existing events for location'
    if (error) logError(req.originalUrl, error, errorMessage)
    res.status(500)
    return res.json({ errorMessage })
  }
}