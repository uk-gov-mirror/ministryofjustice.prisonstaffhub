const viewAppointmentsRouter = require('../routes/appointments/viewAppointmentsRouter.js')

describe('View appointments', () => {
  const prisonApi = {}
  const whereaboutsApi = {}
  const oauthApi = {}

  let req
  let res
  let logError
  let controller

  const activeCaseLoadId = 'MDI'

  beforeEach(() => {
    req = {
      query: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          activeCaseLoadId,
        },
      },
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    oauthApi.userDetails = jest.fn()
    prisonApi.getAppointmentTypes = jest.fn()
    prisonApi.getLocationsForAppointments = jest.fn()
    prisonApi.getAppointmentsForAgency = jest.fn()
    prisonApi.getStaffDetails = jest.fn()
    prisonApi.getDetails = jest.fn()

    prisonApi.getAppointmentTypes.mockReturnValue([{ description: 'Video link booking', code: 'VLB' }])
    prisonApi.getLocationsForAppointments.mockReturnValue([{ userDescription: 'VCC Room 1', locationId: '1' }])
    prisonApi.getAppointmentsForAgency.mockReturnValue([])
    prisonApi.getStaffDetails.mockResolvedValue([])
    prisonApi.getDetails.mockResolvedValue({})

    whereaboutsApi.getVideoLinkAppointments = jest.fn()
    whereaboutsApi.getVideoLinkAppointments.mockReturnValue({ appointments: [] })

    oauthApi.userDetails.mockResolvedValue({
      name: 'Bob Doe',
    })

    controller = viewAppointmentsRouter({ prisonApi, whereaboutsApi, logError, oauthApi })
  })

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1577869200000) // 2020-01-01 09:00:00
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

  describe('when the page is first loaded with no results', () => {
    it('should make the correct API calls', async () => {
      await controller(req, res)

      expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(res.locals)
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(res.locals, activeCaseLoadId)
      expect(prisonApi.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
        agencyId: activeCaseLoadId,
        date: '2020-01-01',
        timeSlot: 'AM',
      })
      expect(whereaboutsApi.getVideoLinkAppointments).toHaveBeenCalledWith(res.locals, [])
      expect(prisonApi.getStaffDetails).not.toHaveBeenCalled()
    })

    it('should render the correct template information', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewAppointments.njk', {
        appointmentRows: [],
        date: '01/01/2020',
        formattedDate: '1 January 2020',
        locations: [{ text: 'VCC Room 1', value: '1' }],
        timeSlot: 'AM',
        types: [{ text: 'Video link booking', value: 'VLB' }],
      })
    })

    it('should request data for the PM period in the afternoon', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1577880000000) // 2020-01-01 12:00:00

      await controller(req, res)

      expect(prisonApi.getAppointmentsForAgency).toHaveBeenCalledWith(
        res.locals,
        expect.objectContaining({
          timeSlot: 'PM',
        })
      )
      expect(res.render).toHaveBeenCalledWith(
        'viewAppointments.njk',
        expect.objectContaining({
          timeSlot: 'PM',
        })
      )
    })

    it('should request data for the ED period in the evening', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1577898000000) // 2020-01-01 17:00:00

      await controller(req, res)

      expect(prisonApi.getAppointmentsForAgency).toHaveBeenCalledWith(
        res.locals,
        expect.objectContaining({
          timeSlot: 'ED',
        })
      )
      expect(res.render).toHaveBeenCalledWith(
        'viewAppointments.njk',
        expect.objectContaining({
          timeSlot: 'ED',
        })
      )
    })
  })

  describe('when there are selected search parameters with results', () => {
    beforeEach(() => {
      prisonApi.getAppointmentsForAgency.mockReturnValue([
        {
          id: 1,
          offenderNo: 'ABC123',
          firstName: 'OFFENDER',
          lastName: 'ONE',
          date: '2020-01-02',
          startTime: '2020-01-02T12:30:00',
          appointmentTypeDescription: 'Medical - Other',
          appointmentTypeCode: 'MEOT',
          locationDescription: 'HEALTH CARE',
          locationId: 123,
          auditUserId: 'STAFF_1',
          agencyId: 'MDI',
        },
        {
          id: 2,
          offenderNo: 'ABC456',
          firstName: 'OFFENDER',
          lastName: 'TWO',
          date: '2020-01-02',
          startTime: '2020-01-02T13:30:00',
          endTime: '2020-01-02T14:30:00',
          appointmentTypeDescription: 'Gym - Exercise',
          appointmentTypeCode: 'GYM',
          locationDescription: 'GYM',
          locationId: 456,
          auditUserId: 'STAFF_2',
          agencyId: 'MDI',
        },
        {
          id: 3,
          offenderNo: 'ABC789',
          firstName: 'OFFENDER',
          lastName: 'THREE',
          date: '2020-01-02',
          startTime: '2020-01-02T14:30:00',
          endTime: '2020-01-02T15:30:00',
          appointmentTypeDescription: 'Video Link booking',
          appointmentTypeCode: 'VLB',
          locationDescription: 'VCC ROOM',
          locationId: 789,
          auditUserId: 'STAFF_3',
          agencyId: 'MDI',
        },
        {
          id: 4,
          offenderNo: 'ABC456',
          firstName: 'OFFENDER',
          lastName: 'FOUR',
          date: '2020-01-02',
          startTime: '2020-01-02T13:30:00',
          endTime: '2020-01-02T14:30:00',
          appointmentTypeDescription: 'Video Link booking',
          appointmentTypeCode: 'VLB',
          locationDescription: 'VCC ROOM',
          locationId: 456,
          auditUserId: 'STAFF_2',
          agencyId: 'MDI',
        },
      ])

      prisonApi.getStaffDetails
        .mockResolvedValueOnce({
          staffId: 1,
          username: 'STAFF_1',
          firstName: 'STAFF',
          lastName: 'ONE',
        })
        .mockRejectedValueOnce(new Error('Staff member no longer exists'))
        .mockResolvedValueOnce({
          staffId: 3,
          username: 'STAFF_3',
          firstName: 'STAFF',
          lastName: 'THREE',
        })

      prisonApi.getDetails
        .mockResolvedValueOnce({ assignedLivingUnit: { description: '1-1-1' } })
        .mockResolvedValueOnce({ assignedLivingUnit: { description: '2-1-1' } })
        .mockResolvedValueOnce({ assignedLivingUnit: { description: '3-1-1' } })

      whereaboutsApi.getVideoLinkAppointments.mockReturnValue({
        appointments: [
          {
            id: 1,
            bookingId: 1,
            appointmentId: 3,
            court: 'Wimbledon',
            hearingType: 'MAIN',
            createdByUsername: 'username1',
            madeByTheCourt: true,
          },
        ],
      })

      req.query = {
        date: '02/01/2020',
        timeSlot: 'PM',
      }
    })
    it('should make the correct API calls', async () => {
      await controller(req, res)

      expect(prisonApi.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
        agencyId: activeCaseLoadId,
        date: '2020-01-02',
        timeSlot: 'PM',
      })
      expect(whereaboutsApi.getVideoLinkAppointments).toHaveBeenCalledWith(res.locals, [3, 4])
      expect(prisonApi.getStaffDetails).toHaveBeenCalledTimes(3)
      expect(prisonApi.getDetails).toHaveBeenCalledTimes(4)
      expect(oauthApi.userDetails).toHaveBeenCalledTimes(1)
    })

    it('should make a call to get user details', async () => {
      await controller(req, res)
      expect(oauthApi.userDetails).toHaveBeenCalledWith(res.locals, 'username1')
    })

    it('should render the correct template information', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'viewAppointments.njk',
        expect.objectContaining({
          appointmentRows: [
            [
              { text: '12:30' },
              {
                attributes: { 'data-sort-value': 'ONE' },
                html: '<a href="/prisoner/ABC123" class="govuk-link">One, Offender - ABC123</a>',
              },
              { text: '2-1-1' },
              { text: 'Medical - Other' },
              { html: 'HEALTH CARE' },
              { text: 'Staff One' },
            ],
            [
              { text: '13:30 to 14:30' },
              {
                attributes: { 'data-sort-value': 'TWO' },
                html: '<a href="/prisoner/ABC456" class="govuk-link">Two, Offender - ABC456</a>',
              },
              { text: '3-1-1' },
              { text: 'Gym - Exercise' },
              { html: 'GYM' },
              { text: '--' },
            ],
            [
              { text: '14:30 to 15:30' },
              {
                attributes: { 'data-sort-value': 'THREE' },
                html: '<a href="/prisoner/ABC789" class="govuk-link">Three, Offender - ABC789</a>',
              },
              { text: '1-1-1' },
              { text: 'Video Link booking' },
              { html: 'VCC ROOM</br>with: Wimbledon' },
              { text: 'Bob Doe (court)' },
            ],
            [
              { text: '13:30 to 14:30' },
              {
                attributes: { 'data-sort-value': 'FOUR' },
                html: '<a href="/prisoner/ABC456" class="govuk-link">Four, Offender - ABC456</a>',
              },
              { text: undefined },
              { text: 'Video Link booking' },
              { html: 'VCC ROOM' },
              { text: 'Staff Three' },
            ],
          ],
          date: '02/01/2020',
          formattedDate: '2 January 2020',
          locationId: undefined,
          locations: [{ text: 'VCC Room 1', value: '1' }],
          timeSlot: 'PM',
          type: undefined,
          types: [{ text: 'Video link booking', value: 'VLB' }],
        })
      )
    })

    it('should only return appointments with selected appointment type', async () => {
      req.query = {
        ...req.query,
        type: 'GYM',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'viewAppointments.njk',
        expect.objectContaining({
          appointmentRows: [
            [
              { text: '13:30 to 14:30' },
              {
                html: '<a href="/prisoner/ABC456" class="govuk-link">Two, Offender - ABC456</a>',
                attributes: {
                  'data-sort-value': 'TWO',
                },
              },
              { text: '1-1-1' },
              { text: 'Gym - Exercise' },
              { html: 'GYM' },
              { text: 'Staff One' },
            ],
          ],
          type: 'GYM',
        })
      )
    })

    it('should not specify a timeSlot when All is selected for period', async () => {
      req.query = {
        ...req.query,
        timeSlot: 'All',
      }

      await controller(req, res)

      expect(prisonApi.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
        agencyId: activeCaseLoadId,
        date: '2020-01-02',
      })
    })
  })

  describe('when there is an error retrieving information', () => {
    it('should render the error template', async () => {
      const error = new Error('Problem retrieving appointment types')
      prisonApi.getAppointmentTypes.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
    })
  })
})
