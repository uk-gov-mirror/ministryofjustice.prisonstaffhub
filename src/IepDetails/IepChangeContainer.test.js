import React from 'react'
import testRenderer from 'react-test-renderer'
import { shallow } from 'enzyme/build'
import IepChangeContainer from './IepChangeContainer'
import AdjudicationHistoryContainer from '../Adjudications/AdjudicationHistory/AdjudicationHistoryContainer'
import OffenderPage from '../OffenderPage'

const initialState = {
  iepHistory: {
    currentIepLevel: 'Standard',
    daysOnIepLevel: '625',
    currentIepDateTime: '2017-08-15T16:04:35',
    nextReviewDate: '15/08/2018',
    establishments: [{ agencyId: 'LEI', description: 'Leeds' }],
    levels: ['Standard'],
    results: [
      {
        bookingId: -1,
        iepDate: '2017-08-13',
        iepTime: '2017-08-13T16:04:35',
        formattedTime: '13/08/2017 - 16:04',
        iepEstablishment: 'Leeds',
        iepStaffMember: 'Staff Member',
        agencyId: 'LEI',
        iepLevel: 'Standard',
        userId: 'ITAG_USER',
      },
    ],
  },
  app: {
    user: {
      roles: ['MAINTAIN_IEP'],
      currentCaseLoadId: 'LEI',
    },
  },
  iepLevels: {
    levels: [
      {
        diff: -1,
        image: 'Red_arrow.png',
        title: 'Basic',
        value: 'BAS',
      },
      {
        diff: 1,
        image: 'Green_arrow.png',
        title: 'Enhanced',
        value: 'ENH',
      },
    ],
  },
  offenderDetails: {
    offenderNo: 'AAA123',
  },
}

describe('IEP change container', () => {
  const store = {}
  const history = {}
  beforeEach(() => {
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    history.push = jest.fn()
    history.replace = jest.fn()
    store.getState.mockReturnValue(initialState)
  })

  it('should render the iep history table correctly', () => {
    const wrapper = shallow(
      <IepChangeContainer
        store={store}
        handleError={jest.fn()}
        setLoadedDispatch={jest.fn()}
        resetErrorDispatch={jest.fn()}
        history={history}
      />
    )

    const page = wrapper.dive().find(OffenderPage)

    expect(page.getElement().props.title()).toBe('Change IEP level')
    expect(page.find('Connect(IepChangeForm)').length).toBe(1)
  })
})
