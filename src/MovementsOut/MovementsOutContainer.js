import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import axios from 'axios'

import MovementsOut from './MovementsOut'
import { resetError, setLoaded } from '../redux/actions'
import Error from '../Error'
import { ASC } from '../tablesorting/sortOrder'
import Page from '../Components/Page'
import routePaths from '../routePaths'

import SortableDataSource from '../tablesorting/SortableDataSource'
import { lastNameComparator } from '../tablesorting/comparatorComposition'

class MovementsOutContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      movementsOut: [],
    }
  }

  componentDidMount() {
    this.getMovementsOut()
  }

  componentDidUpdate(previousProps) {
    const { agencyId, history } = this.props

    if (agencyId !== previousProps.agencyId) {
      history.push(routePaths.establishmentRoll)
    }
  }

  async getMovementsOut() {
    const { agencyId, handleError, resetErrorDispatch, setLoadedDispatch } = this.props
    try {
      resetErrorDispatch()
      setLoadedDispatch(false)
      const response = await axios.get(`/api/movements/${agencyId}/out`)
      const movementsOut = response.data
      this.setState({ movementsOut })
      setLoadedDispatch(true)
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { movementsOut, loaded } = this.state
    const { error } = this.props

    return (
      <Page title="Out today" error={error} loaded={loaded}>
        <Error error={error} />
        <SortableDataSource sortOrder={ASC} rows={movementsOut} comparator={lastNameComparator}>
          <MovementsOut />
        </SortableDataSource>
      </Page>
    )
  }
}

MovementsOutContainer.propTypes = {
  handleError: PropTypes.func.isRequired,
  agencyId: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
  resetErrorDispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
}

MovementsOutContainer.defaultProps = {
  error: '',
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  error: state.app.error,
})

const mapDispatchToProps = dispatch => ({
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MovementsOutContainer)