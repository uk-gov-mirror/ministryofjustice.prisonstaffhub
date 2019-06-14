import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { spacing, typography } from '@govuk-react/lib'

const StyledTotalResults = styled.div`
  ${spacing.withWhiteSpace({ margin: { size: 3, direction: 'bottom' } })};
  ${typography.font({ size: 24 })};

  @media print {
    ${spacing.withWhiteSpace({ margin: { size: 3, direction: 'top' } })};
  }
`
const TotalNumber = styled.span`
  font-weight: bold;
`

const TotalResults = ({ totalResults }) => (
  <StyledTotalResults>
    Prisoners listed: <TotalNumber>{totalResults}</TotalNumber>
  </StyledTotalResults>
)

TotalResults.propTypes = {
  totalResults: PropTypes.number,
}

TotalResults.defaultProps = {
  totalResults: 0,
}

export default TotalResults