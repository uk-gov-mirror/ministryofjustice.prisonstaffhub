const elite2Api = {}
const iepDetails = require('../controllers/iepDetails').getIepDetailsFactory(elite2Api).getIepDetails

function createIepDetailsReponse() {
  return {
    currentIepLevel: 'Standard',
    daysOnIepLevel: '1 year, 260 days',
    currentIepDateTime: '2017-08-15T16:04:35',
    nextReviewDate: '15/08/2018',
    establishments: [{ agencyId: 'HEI', description: 'Hewell' }, { agencyId: 'LEI', description: 'Leeds' }],
    levels: ['Basic', 'Enhanced', 'Standard'],
    results: [
      {
        bookingId: -1,
        iepDate: '2017-08-15',
        iepTime: '2017-08-15T16:04:35',
        formattedTime: '15/08/2017 - 16:04',
        iepEstablishment: 'Leeds',
        iepStaffMember: 'Staff Member',
        agencyId: 'LEI',
        iepLevel: 'Standard',
        userId: 'ITAG_USER',
      },
      {
        bookingId: -1,
        iepDate: '2017-08-10',
        iepTime: '2017-08-10T16:04:35',
        formattedTime: '10/08/2017 - 16:04',
        iepEstablishment: 'Hewell',
        iepStaffMember: 'Staff Member',
        agencyId: 'HEI',
        iepLevel: 'Basic',
        userId: 'ITAG_USER',
      },
      {
        bookingId: -1,
        iepDate: '2017-08-07',
        iepTime: '2017-08-07T16:04:35',
        formattedTime: '07/08/2017 - 16:04',
        iepEstablishment: 'Hewell',
        iepStaffMember: 'Staff Member',
        agencyId: 'HEI',
        iepLevel: 'Enhanced',
        userId: 'ITAG_USER',
      },
    ],
  }
}

beforeEach(() => {
  elite2Api.getDetails = jest.fn()
  elite2Api.getIepSummaryWithDetails = jest.fn()
  elite2Api.getAgencyDetails = jest.fn()
  elite2Api.getStaffDetails = jest.fn()
})

describe('IEP details controller', async () => {
  beforeEach(() => {
    elite2Api.getDetails.mockReturnValue({
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
    })

    elite2Api.getStaffDetails.mockReturnValue({
      username: 'ITAG_USER',
      firstName: 'Staff',
      lastName: 'Member',
    })

    elite2Api.getAgencyDetails
      .mockReturnValueOnce({
        agencyId: 'HEI',
        description: 'Hewell',
      })
      .mockReturnValueOnce({
        agencyId: 'LEI',
        description: 'Leeds',
      })
    elite2Api.getIepSummaryWithDetails.mockReturnValue({
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      iepLevel: 'Standard',
      daysSinceReview: 625,
      iepDetails: [
        {
          bookingId: -1,
          iepDate: '2017-08-15',
          iepTime: '2017-08-15T16:04:35',
          agencyId: 'LEI',
          iepLevel: 'Standard',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-07',
          iepTime: '2017-08-07T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Enhanced',
          userId: 'ITAG_USER',
        },
      ],
    })
  })
  it('Should return the IEP history for offender', async () => {
    const response = await iepDetails({}, '1', {})
    const expected = createIepDetailsReponse()
    expect(response).toEqual(expected)

    expect(elite2Api.getDetails.mock.calls.length).toBe(1)
    expect(elite2Api.getIepSummaryWithDetails.mock.calls.length).toBe(1)
  })

  it('Should filter by level', async () => {
    const response = await iepDetails({}, '1', { level: 'Basic' })
    expect(response).toEqual({
      currentIepLevel: 'Standard',
      daysOnIepLevel: '1 year, 260 days',
      currentIepDateTime: '2017-08-15T16:04:35',
      nextReviewDate: '15/08/2018',
      establishments: [{ agencyId: 'HEI', description: 'Hewell' }, { agencyId: 'LEI', description: 'Leeds' }],
      levels: ['Basic', 'Enhanced', 'Standard'],
      results: [
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          formattedTime: '10/08/2017 - 16:04',
          iepEstablishment: 'Hewell',
          iepStaffMember: 'Staff Member',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
      ],
    })

    expect(elite2Api.getDetails.mock.calls.length).toBe(1)
    expect(elite2Api.getIepSummaryWithDetails.mock.calls.length).toBe(1)
  })

  it('Should filter by date', async () => {
    const response = await iepDetails({}, '1', { fromDate: '2017-08-10', toDate: '2017-08-11' })
    expect(response).toEqual({
      currentIepLevel: 'Standard',
      daysOnIepLevel: '1 year, 260 days',
      currentIepDateTime: '2017-08-15T16:04:35',
      nextReviewDate: '15/08/2018',
      establishments: [{ agencyId: 'HEI', description: 'Hewell' }, { agencyId: 'LEI', description: 'Leeds' }],
      levels: ['Basic', 'Enhanced', 'Standard'],
      results: [
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          formattedTime: '10/08/2017 - 16:04',
          iepEstablishment: 'Hewell',
          iepStaffMember: 'Staff Member',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
      ],
    })

    expect(elite2Api.getDetails.mock.calls.length).toBe(1)
    expect(elite2Api.getIepSummaryWithDetails.mock.calls.length).toBe(1)
  })

  it('Should filter by establishment', async () => {
    const response = await iepDetails({}, '1', { establishment: 'HEI' })
    expect(response).toEqual({
      currentIepLevel: 'Standard',
      daysOnIepLevel: '1 year, 260 days',
      currentIepDateTime: '2017-08-15T16:04:35',
      nextReviewDate: '15/08/2018',
      establishments: [{ agencyId: 'HEI', description: 'Hewell' }, { agencyId: 'LEI', description: 'Leeds' }],
      levels: ['Basic', 'Enhanced', 'Standard'],
      results: [
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          formattedTime: '10/08/2017 - 16:04',
          iepEstablishment: 'Hewell',
          iepStaffMember: 'Staff Member',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-07',
          iepTime: '2017-08-07T16:04:35',
          formattedTime: '07/08/2017 - 16:04',
          iepEstablishment: 'Hewell',
          iepStaffMember: 'Staff Member',
          agencyId: 'HEI',
          iepLevel: 'Enhanced',
          userId: 'ITAG_USER',
        },
      ],
    })

    expect(elite2Api.getDetails.mock.calls.length).toBe(1)
    expect(elite2Api.getIepSummaryWithDetails.mock.calls.length).toBe(1)
  })

  it('Should filter by all filters', async () => {
    const response = await iepDetails({}, '1', {
      establishment: 'HEI',
      level: 'Basic',
      fromDate: '2017-08-10',
      toDate: '2017-08-11',
    })
    expect(response).toEqual({
      currentIepLevel: 'Standard',
      daysOnIepLevel: '1 year, 260 days',
      currentIepDateTime: '2017-08-15T16:04:35',
      nextReviewDate: '15/08/2018',
      establishments: [{ agencyId: 'HEI', description: 'Hewell' }, { agencyId: 'LEI', description: 'Leeds' }],
      levels: ['Basic', 'Enhanced', 'Standard'],
      results: [
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          formattedTime: '10/08/2017 - 16:04',
          iepEstablishment: 'Hewell',
          iepStaffMember: 'Staff Member',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
      ],
    })

    expect(elite2Api.getDetails.mock.calls.length).toBe(1)
    expect(elite2Api.getIepSummaryWithDetails.mock.calls.length).toBe(1)
  })

  it('Should return "Changed today" when 0 days since review', async () => {
    elite2Api.getIepSummaryWithDetails.mockReturnValue({
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      iepLevel: 'Standard',
      daysSinceReview: 0,
      iepDetails: [
        {
          bookingId: -1,
          iepDate: '2017-08-15',
          iepTime: '2017-08-15T16:04:35',
          agencyId: 'LEI',
          iepLevel: 'Standard',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-07',
          iepTime: '2017-08-07T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Enhanced',
          userId: 'ITAG_USER',
        },
      ],
    })
    const response = await iepDetails({}, '1', {
      establishment: 'HEI',
      level: 'Basic',
      fromDate: '2017-08-10',
      toDate: '2017-08-11',
    })
    expect(response).toEqual({
      currentIepLevel: 'Standard',
      daysOnIepLevel: 'Changed today',
      currentIepDateTime: '2017-08-15T16:04:35',
      nextReviewDate: '15/08/2018',
      establishments: [{ agencyId: 'HEI', description: 'Hewell' }, { agencyId: 'LEI', description: 'Leeds' }],
      levels: ['Basic', 'Enhanced', 'Standard'],
      results: [
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          formattedTime: '10/08/2017 - 16:04',
          iepEstablishment: 'Hewell',
          iepStaffMember: 'Staff Member',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
      ],
    })

    expect(elite2Api.getDetails.mock.calls.length).toBe(1)
    expect(elite2Api.getIepSummaryWithDetails.mock.calls.length).toBe(1)
  })
})