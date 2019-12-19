const existingEventsService = require('../controllers/existingEventsService')

describe('existing events', () => {
  const elite2Api = {}
  let service

  beforeEach(() => {
    service = existingEventsService(elite2Api)
  })

  describe('getting events for offenders', () => {
    beforeEach(() => {
      elite2Api.getSentenceData = jest.fn()
      elite2Api.getVisits = jest.fn()
      elite2Api.getAppointments = jest.fn()
      elite2Api.getExternalTransfers = jest.fn()
      elite2Api.getCourtEvents = jest.fn()
      elite2Api.getActivities = jest.fn()
    })

    it('should call the correct endpoints with the correct parameters', async () => {
      const expectedParameters = {
        agencyId: 'LEI',
        date: '2019-12-11',
        offenderNumbers: ['ABC123'],
      }

      await service.getExistingEventsForOffender({}, 'LEI', '11/12/2019', 'ABC123')

      expect(elite2Api.getVisits).toHaveBeenCalledWith({}, expectedParameters)
      expect(elite2Api.getAppointments).toHaveBeenCalledWith({}, expectedParameters)
      expect(elite2Api.getExternalTransfers).toHaveBeenCalledWith({}, expectedParameters)
      expect(elite2Api.getCourtEvents).toHaveBeenCalledWith({}, expectedParameters)
      expect(elite2Api.getActivities).toHaveBeenCalledWith({}, expectedParameters)
    })

    describe('when there are no errors', () => {
      beforeEach(() => {
        elite2Api.getSentenceData = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            firstName: 'Test',
            lastName: 'Offender',
            agencyLocationId: 'LEI',
            sentenceDetail: {
              releaseDate: '2019-12-11',
            },
          },
        ])
        elite2Api.getVisits = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 1,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'VISIT',
            eventDescription: 'Visit',
            eventLocation: 'Visiting room',
            comment: 'A comment.',
            startTime: '2019-12-11T14:00:00',
            endTime: '2019-12-11T15:00:00',
          },
        ])
        elite2Api.getAppointments = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 2,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'APPT',
            eventDescription: 'An appointment',
            eventLocation: 'Office 1',
            startTime: '2019-12-11T12:00:00',
            endTime: '2019-12-11T13:00:00',
          },
        ])
        elite2Api.getExternalTransfers = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 3,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'TRANS',
            eventDescription: 'Transfer',
            eventLocation: 'Somewhere else',
            comment: 'A comment.',
            startTime: '2019-12-11T16:00:00',
            endTime: '2019-12-11T17:00:00',
          },
        ])
        elite2Api.getCourtEvents = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            eventId: 4,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'CRT',
            eventType: 'COURT',
            eventDescription: 'Court Appearance',
            eventStatus: 'SCH',
            startTime: '2019-12-11T11:00:00',
          },
        ])
        elite2Api.getActivities = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 5,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'ACTIVITY',
            eventDescription: 'Prison Activities',
            eventLocation: 'Somewhere',
            comment: 'A comment.',
            startTime: '2019-12-11T18:00:00',
            endTime: '2019-12-11T19:00:00',
          },
        ])
      })

      it('should return events sorted by start time', async () => {
        const events = await service.getExistingEventsForOffender({}, 'LEI', '11/12/2019', 'ABC123')

        expect(events).toEqual([
          { eventDescription: '**Due for release**' },
          { eventDescription: '**Court visit scheduled**' },
          expect.objectContaining({
            locationId: 2,
            eventDescription: 'Office 1 - An appointment',
            startTime: '12:00',
            endTime: '13:00',
          }),
          expect.objectContaining({
            locationId: 1,
            eventDescription: 'Visiting room - Visit - A comment.',
            startTime: '14:00',
            endTime: '15:00',
          }),
          expect.objectContaining({
            locationId: 3,
            eventDescription: 'Somewhere else - Transfer - A comment.',
            startTime: '16:00',
            endTime: '17:00',
          }),
          expect.objectContaining({
            locationId: 5,
            eventDescription: 'Somewhere - Activity - A comment.',
            startTime: '18:00',
            endTime: '19:00',
          }),
        ])
      })
    })

    describe('when there are errors with elite2Api', () => {
      it('should return the error', async () => {
        const error = new Error('Network error')
        elite2Api.getVisits.mockImplementation(() => Promise.reject(error))

        const events = await service.getExistingEventsForOffender({}, 'LEI', '11/12/2019', 'ABC123')

        expect(events).toEqual(error)
      })
    })
  })

  describe('get events for a location', () => {
    beforeEach(() => {
      elite2Api.getActivitiesAtLocation = jest.fn()
      elite2Api.getActivityList = jest.fn()
    })

    it('should call the correct endpoints with the correct parameters', async () => {
      const expectedParameters = {
        agencyId: 'LEI',
        date: '2019-12-11',
        locationId: 123,
      }

      await service.getExistingEventsForLocation({}, 'LEI', 123, '11/12/2019')

      expect(elite2Api.getActivitiesAtLocation).toHaveBeenCalledWith({}, expectedParameters)
      expect(elite2Api.getActivityList).toHaveBeenCalledWith({}, { ...expectedParameters, usage: 'VISIT' })
      expect(elite2Api.getActivityList).toHaveBeenCalledWith({}, { ...expectedParameters, usage: 'APP' })
    })

    describe('when there are no errors', () => {
      beforeEach(() => {
        elite2Api.getActivitiesAtLocation = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 1,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'PRISON_ACT',
            eventDescription: 'Prison activity',
            eventLocation: 'Gym',
            comment: 'A comment.',
            startTime: '2019-12-11T15:00:00',
            endTime: '2019-12-11T16:00:00',
          },
        ])
        elite2Api.getActivityList = jest
          .fn()
          .mockResolvedValueOnce([
            {
              offenderNo: 'ABC123',
              locationId: 2,
              firstName: 'Test',
              lastName: 'Offender',
              event: 'VISIT',
              eventDescription: 'Visit',
              eventLocation: 'Visiting room',
              comment: 'A comment.',
              startTime: '2019-12-11T14:00:00',
              endTime: '2019-12-11T15:00:00',
            },
          ])
          .mockResolvedValueOnce([
            {
              offenderNo: 'ABC123',
              locationId: 3,
              firstName: 'Test',
              lastName: 'Offender',
              event: 'APPT',
              eventDescription: 'An appointment',
              eventLocation: 'Office 1',
              startTime: '2019-12-11T12:00:00',
              endTime: '2019-12-11T13:00:00',
            },
          ])
      })

      it('should return events sorted by start time', async () => {
        const events = await service.getExistingEventsForLocation({}, 'LEI', 123, '11/12/2019')

        expect(events).toEqual([
          expect.objectContaining({
            locationId: 3,
            eventDescription: 'Office 1 - An appointment',
            startTime: '12:00',
            endTime: '13:00',
          }),
          expect.objectContaining({
            locationId: 2,
            eventDescription: 'Visiting room - Visit - A comment.',
            startTime: '14:00',
            endTime: '15:00',
          }),
          expect.objectContaining({
            locationId: 1,
            eventDescription: 'Gym - Prison activity - A comment.',
            startTime: '15:00',
            endTime: '16:00',
          }),
        ])
      })
    })

    describe('when there are errors with elite2Api', () => {
      it('should return the error', async () => {
        const error = new Error('Network error')
        elite2Api.getActivitiesAtLocation.mockImplementation(() => Promise.reject(error))

        const events = await service.getExistingEventsForLocation({}, 'LEI', 123, '11/12/2019')

        expect(events).toEqual(error)
      })
    })
  })
})