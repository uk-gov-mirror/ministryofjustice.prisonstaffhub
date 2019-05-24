import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Radio from '@govuk-react/radio'
import VisuallyHidden from '@govuk-react/visually-hidden'
import { MEDIA_QUERIES } from '@govuk-react/constants'

const Option = styled.td`
  label {
    margin-bottom: 0;
  }

  ${MEDIA_QUERIES.PRINT} {
    display: none;
  }
`
function PayOptions({
  offenderNo,
  eventId,
  eventLocationId,
  updateOffenderAttendance,
  otherHandler,
  firstName,
  lastName,
  payStatus,
  offenderIndex,
}) {
  const [selectedOption, setSelectedOption] = useState()

  const payOffender = () => {
    const attendanceDetails = {
      offenderNo,
      attended: true,
      paid: true,
      eventId,
      eventLocationId,
    }

    updateOffenderAttendance(attendanceDetails, offenderIndex)
  }

  useEffect(() => {
    if (payStatus && payStatus.pay) setSelectedOption('pay')
    if (payStatus && payStatus.other) setSelectedOption('other')
  })

  return (
    <Fragment>
      <Option data-qa="pay-option">
        {offenderNo &&
          eventId && (
            <Radio onChange={payOffender} name={offenderNo} value="pay" checked={selectedOption === 'pay'}>
              <VisuallyHidden>Pay</VisuallyHidden>
            </Radio>
          )}
      </Option>

      <Option data-qa="other-option">
        {offenderNo &&
          eventId && (
            <Radio
              name={offenderNo}
              onChange={otherHandler}
              value="other"
              data-first-name={firstName}
              data-last-name={lastName}
              data-event-id={eventId}
              data-event-location-id={eventLocationId}
              data-offender-index={offenderIndex}
              checked={selectedOption === 'other'}
            >
              <VisuallyHidden>Other</VisuallyHidden>
            </Radio>
          )}
      </Option>
    </Fragment>
  )
}

PayOptions.propTypes = {
  offenderNo: PropTypes.string,
  eventId: PropTypes.number,
  otherHandler: PropTypes.func.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  payStatus: PropTypes.shape({ pay: PropTypes.bool, other: PropTypes.bool }),
  eventLocationId: PropTypes.number,
  updateOffenderAttendance: PropTypes.func.isRequired,
  offenderIndex: PropTypes.number,
}

PayOptions.defaultProps = {
  offenderNo: undefined,
  eventId: undefined,
  firstName: undefined,
  lastName: undefined,
  payStatus: undefined,
  eventLocationId: undefined,
  offenderIndex: undefined,
}

export default PayOptions