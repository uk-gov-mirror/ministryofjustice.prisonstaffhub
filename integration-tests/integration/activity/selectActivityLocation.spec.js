const moment = require('moment')

const caseload = 'MDI'
const date = new Date().toISOString().split('T')[0]

// copy of { getCurrentPeriod } from backend/utils/.js
const getCurrentPeriod = now => {
  const afternoonSplit = 12
  const eveningSplit = 17
  const currentHour = moment(now).format('H')

  if (currentHour < afternoonSplit) return 'AM'
  if (currentHour < eveningSplit) return 'PM'
  return 'ED'
}

context('Select activity location', () => {
  const headerText = 'View by activity or appointment location'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubGroups', { id: caseload })
    cy.task('stubLogin', { username: 'ITAG_USER', caseload })
    cy.login()
    cy.task('stubActivityLocations')

    const offenders = [
      {
        bookingId: 1,
        offenderNo: 'A1234AA',
      },
      {
        bookingId: 2,
        offenderNo: 'A1234AC',
      },
      {
        bookingId: 3,
        offenderNo: 'A1234AB',
      },
      {
        bookingId: 4,
        offenderNo: 'A1234AA',
      },
      {
        bookingId: 5,
        offenderNo: 'A1234AA',
      },
    ]
    offenders.forEach(offender => {
      cy.task('stubOffenderBasicDetails', offender)
    })
    cy.task('stubGetAbsenceReasons')
  })

  it('should redirect to the activity lists page', () => {
    const now = moment()

    cy.task('stubGetActivityList', { caseload, locationId: 2, timeSlot: getCurrentPeriod(now), date })
    cy.task('stubGetAttendance', { caseload, locationId: 2, timeSlot: getCurrentPeriod(now), date })

    cy.visit('/manage-prisoner-whereabouts/select-location')

    cy.get('h1').contains(headerText)
    cy.get('#current-location').select('loc2')

    cy.get('h1').contains(headerText)
    cy.get('[type="submit"]').click()

    cy.location('pathname').should('eq', '/manage-prisoner-whereabouts/activity-results')

    cy.get('h1').contains('loc2')
  })
})
