Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const globalSearchApi = {}
const { globalSearch } = require('./globalSearch').globalSearchFactory(elite2Api, globalSearchApi)

jest.mock('shortid', () => ({
  generate: () => '123',
}))

beforeEach(() => {
  globalSearchApi.globalSearch = jest.fn()
  elite2Api.getLastPrison = jest.fn()
})

function createResponse() {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      latestLocation: 'Leeds HMP',
      latestLocationId: 'LEI',
      dateOfBirth: '1977-10-15',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      latestLocationId: 'MDI',
      latestLocation: 'Moorland HMP',
      dateOfBirth: '1976-09-15',
    },
  ]
}

function createResponseWithFormattedDate() {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      latestLocation: 'Leeds HMP',
      latestLocationId: 'LEI',
      dateOfBirth: '15/10/1977',
      uiId: '123',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      latestLocationId: 'MDI',
      latestLocation: 'Moorland HMP',
      dateOfBirth: '15/09/1976',
      uiId: '123',
    },
  ]
}

function createOutResponse() {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      latestLocation: 'Leeds HMP',
      latestLocationId: 'LEI',
      dateOfBirth: '1977-10-15',
      uiId: '123',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      latestLocationId: 'MDI',
      latestLocation: 'Moorland HMP',
      dateOfBirth: '1976-09-15',
      uiId: '123',
    },
    {
      offenderNo: 'A1234BB',
      firstName: 'MEL',
      lastName: 'DAMP',
      latestLocationId: 'OUT',
      latestLocation: 'OUTSIDE',
      dateOfBirth: '1976-09-15',
      uiId: '123',
    },
  ]
}

function createDecoratedResponse(locationText) {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      latestLocation: 'Leeds HMP',
      latestLocationId: 'LEI',
      dateOfBirth: '15/10/1977',
      uiId: '123',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      latestLocationId: 'MDI',
      latestLocation: 'Moorland HMP',
      dateOfBirth: '15/09/1976',
      uiId: '123',
    },
    {
      offenderNo: 'A1234BB',
      firstName: 'MEL',
      lastName: 'DAMP',
      latestLocationId: 'OUT',
      latestLocation: locationText,
      dateOfBirth: '15/09/1976',
      uiId: '123',
    },
  ]
}

function getLastPrisonResponseReleased() {
  return [
    {
      offenderNo: 'A1234BB',
      createDateTime: '2016-05-04T09:24:46.254162',
      fromAgencyDescription: 'Near Leeds',
      toAgencyDescription: 'OUT',
      movementTypeDescription: 'Release',
      movementType: 'REL',
      directionCode: 'OUT',
    },
  ]
}

function getLastPrisonResponseCourtVisit() {
  return [
    {
      offenderNo: 'A1234BB',
      createDateTime: '2016-05-04T09:24:46.254162',
      fromAgencyDescription: 'Near Leeds',
      toAgencyDescription: 'OUT',
      movementTypeDescription: 'Court visit',
      movementType: 'CRT',
      directionCode: 'OUT',
    },
  ]
}

describe('Global Search controller', () => {
  it('Should return no results as an empty array', async () => {
    globalSearchApi.globalSearch.mockReturnValue([])

    const response = await globalSearch({}, 'text', '', '', '')
    expect(response).toEqual([])

    expect(globalSearchApi.globalSearch).toHaveBeenCalled()

    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        firstName: undefined,
        gender: '',
        lastName: 'text',
        location: '',
        includeAliases: true,
      },
    ])
  })

  it('Should return results', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    const response = await globalSearch({}, 'text')
    expect(response).toEqual(createResponseWithFormattedDate())
  })

  it('Should add released text', async () => {
    globalSearchApi.globalSearch.mockReturnValue(createOutResponse())
    elite2Api.getLastPrison.mockReturnValue(getLastPrisonResponseReleased())

    const response = await globalSearch({}, 'text')
    expect(response).toEqual(createDecoratedResponse('Outside - released from Near Leeds'))
  })

  it('Should add other movement text', async () => {
    globalSearchApi.globalSearch.mockReturnValue(createOutResponse())
    elite2Api.getLastPrison.mockReturnValue(getLastPrisonResponseCourtVisit())

    const response = await globalSearch({}, 'text')
    expect(response).toEqual(createDecoratedResponse('Outside - Court visit'))
  })

  it('Should detect an offenderId', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    const offenderNo = 'Z4444YY'
    await globalSearch({}, offenderNo, '', '', '', '')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        gender: '',
        location: '',
        offenderNo: 'Z4444YY',
        prisonerIdentifier: 'Z4444YY',
        includeAliases: true,
      },
    ])
  })

  it('Should detect an offenderId with lowercase letters', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    const offenderNo = 'z4444yy'
    await globalSearch({}, offenderNo, '', '', '')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        gender: '',
        location: '',
        offenderNo: 'z4444yy',
        prisonerIdentifier: 'z4444yy',
        includeAliases: true,
      },
    ])
  })

  it('Should detect 2 words', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, 'last first', '', '', '')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        firstName: 'first',
        gender: '',
        lastName: 'last',
        location: '',
        includeAliases: true,
      },
    ])
  })

  it('Should detect 2 words and remove commas', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, ',last, first,', '', '', '')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        firstName: 'first',
        gender: '',
        lastName: 'last',
        location: '',
        includeAliases: true,
      },
    ])
  })

  it('Should detect 2 words with no space between comma', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, ',last, first,', '', '', '')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        firstName: 'first',
        gender: '',
        lastName: 'last',
        location: '',
        includeAliases: true,
      },
    ])
  })

  it('Should detect 2 words with various spaces and commas', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, ', last , first other, ', '', '', '')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        firstName: 'first',
        gender: '',
        lastName: 'last',
        location: '',
        includeAliases: true,
      },
    ])
  })

  it('Should propagate filter values to global search call', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, ', last , first other, ', 'F', 'OUT', '2000-01-02')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '2000-01-02',
        firstName: 'first',
        gender: 'F',
        lastName: 'last',
        location: 'OUT',
        includeAliases: true,
      },
    ])
  })

  it('Should propagate filter values to global search by offender call', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    const offenderNo = 'z4444yy'
    await globalSearch({}, offenderNo, 'F', 'OUT', '')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        gender: 'F',
        location: 'OUT',
        offenderNo: 'z4444yy',
        prisonerIdentifier: 'z4444yy',
        includeAliases: true,
      },
    ])
  })

  it('Should ignore leading and trailing whitespace', async () => {
    const apiResponse = createResponse()
    globalSearchApi.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, '  word  ', '', '', '')
    expect(globalSearchApi.globalSearch.mock.calls[0]).toEqual([
      {},
      {
        dateOfBirth: '',
        firstName: undefined,
        gender: '',
        lastName: 'word',
        location: '',
        includeAliases: true,
      },
    ])
  })
})