import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'

import { resetError, setLoaded } from '../redux/actions'
import Page from '../Components/Page'
import InReception from './InReception'
import routePaths from '../routePaths'
import SortableDataSource from '../tablesorting/SortableDataSource'

import { ASC } from '../tablesorting/sortOrder'
import { lastNameComparator } from '../tablesorting/comparatorComposition'

class InReceptionContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offendersInReception: [],
    }
  }

  async componentDidMount() {
    const { agencyId, resetErrorDispatch, setLoadedDispatch, handleError } = this.props

    resetErrorDispatch()
    setLoadedDispatch(false)

    try {
      const response = await axios.get(`/api/movements/${agencyId}/in-reception`)

      this.setState({
        offendersInReception: response.data,
      })

      setLoadedDispatch(true)
    } catch (error) {
      handleError(error)
    }
  }

  componentDidUpdate(previousProps) {
    const { agencyId, history } = this.props

    if (agencyId !== previousProps.agencyId) {
      history.push(routePaths.establishmentRoll)
    }
  }

  render() {
    const { loaded, error } = this.props
    const { offendersInReception } = this.state

    return (
      <div>
        <Page title="In reception" loaded={loaded} error={error}>
          <SortableDataSource sortOrder={ASC} rows={offendersInReception} comparator={lastNameComparator}>
            <InReception />
          </SortableDataSource>
        </Page>
      </div>
    )
  }
}

InReceptionContainer.propTypes = {
  agencyId: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  loaded: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  error: state.app.error,
  loaded: state.app.loaded,
})

const mapDispatchToProps = dispatch => ({
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InReceptionContainer)