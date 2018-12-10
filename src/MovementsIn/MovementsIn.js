import React from 'react'
import PropTypes from 'prop-types'
import Page from '../Page/Page'
import SortableColumn from '../tablesorting/SortableColumn'
import OffenderName from '../OffenderName'
import DateFormatter from '../DateFormatter'
import OffenderLink from '../OffenderLink'
import OffenderImage from '../OffenderImage'
import SortLov from '../tablesorting/SortLov'
import Location from '../Location'
import HoursAndMinutes from '../HoursAndMinutes'
import { LAST_NAME } from '../tablesorting/sortColumns'

const movementInType = {
  offenderNo: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  movementTime: PropTypes.string,
  fromAgencyDescription: PropTypes.string,
}

const movementsInType = {
  movementsIn: PropTypes.arrayOf(PropTypes.shape(movementInType)).isRequired,
  sortOrder: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
}

const MovementsIn = props => {
  const { movementsIn, sortOrder, setColumnSort } = props
  return (
    <div>
      <h1 className="heading-large">In Today</h1>
      <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={sortOrder} setColumnSort={setColumnSort} />
      <MovementsInTable movementsIn={movementsIn} sortOrder={sortOrder} setColumnSort={setColumnSort} />
    </div>
  )
}

MovementsIn.propTypes = movementsInType

const MovementsInTable = ({ movementsIn, sortOrder, setColumnSort }) => (
  <table className="row-gutters">
    <MovementsInTableHeadings sortOrder={sortOrder} setColumnSort={setColumnSort} />
    <tbody>
      {movementsIn.map(movementIn => (
        <MovementInRow movementIn={movementIn} key={movementIn.offenderNo} />
      ))}
    </tbody>
  </table>
)

MovementsInTable.propTypes = movementsInType

const MovementsInTableHeadings = props => {
  const { sortOrder, setColumnSort } = props
  return (
    <thead>
      <tr>
        <th className="straight width15" />
        <th className="straight width15">
          <SortableColumn
            heading="Name"
            field={LAST_NAME}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            orderField={LAST_NAME}
          />
        </th>
        <th className="straight width15">Prison No.</th>
        <th className="straight width5">D.O.B.</th>
        <th className="straight width10">Location</th>
        <th className="straight width10">Time in</th>
        <th className="straight width15">Arrived from</th>
        <th className="straight width15">Flags</th>
      </tr>
    </thead>
  )
}
MovementsInTableHeadings.propTypes = {
  sortOrder: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
}

const MovementInRow = props => {
  const {
    movementIn: { lastName, firstName, offenderNo, location, dateOfBirth, movementTime, fromAgencyDescription },
  } = props
  return (
    <tr className="row-gutters">
      <td className="row-gutters">
        <OffenderLink offenderNo={offenderNo}>
          <OffenderImage offenderNo={offenderNo} />
        </OffenderLink>
      </td>
      <td className="row-gutters">
        <OffenderLink offenderNo={offenderNo}>
          <OffenderName lastName={lastName} firstName={firstName} />
        </OffenderLink>
      </td>
      <td className="row-gutters">{offenderNo}</td>
      <td className="row-gutters">
        <DateFormatter isoDate={dateOfBirth} />
      </td>
      <td className="row-gutters">
        <Location location={location} />
      </td>
      <td>
        <HoursAndMinutes hhmmss={movementTime} />
      </td>
      <td>{fromAgencyDescription}</td>
      <td className="row-gutters">Some Flags</td>
    </tr>
  )
}

MovementInRow.propTypes = {
  movementIn: PropTypes.shape(movementInType).isRequired,
}

export default MovementsIn
