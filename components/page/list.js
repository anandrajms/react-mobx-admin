import React from 'react'
import { browserHistory } from 'react-router'


export default class ListPageBase extends React.Component {

  _getFilters(filters) {
    try {
      return JSON.parse(filters)
    } catch(err) {
      return {}
    }
  }

  componentDidMount() {
    const { entityName, state, location, perPage, pkName } = this.props
    const { page, sortField, sortDir, filters } = location.query
    const filterVals = this._getFilters(filters)
    state.loadListData(entityName, pkName || 'id', perPage || 10, page, sortField, sortDir, filterVals)
  }

  componentWillReceiveProps(nextProps) {
    const { state, location } = this.props

    if(nextProps.location.query.filters !== location.query.filters) {
      const filterVals = this._getFilters(nextProps.location.query.filters)
      state.updateFilters(filterVals)
    }
  }

  showFilter(filter) {
    this.props.state.showFilter(filter)
    this._setFilterQuery()
  }

  hideFilter(filter) {
    this.props.state.hideFilter(filter)
    this._setFilterQuery()
  }

  applyFilters() {
    this.props.state.applyFilters()
    this._setFilterQuery()
  }

  _setFilterQuery() {
    const currFilters = this.props.state.filters
    if(currFilters.size === 0) {
      return this._changeQuery({filters: null})
    } else {
      this._changeQuery({filters: currFilters})
    }
  }

  onListSort(field, dir) {
    this.props.state.updateSort(field, dir)
    this._changeQuery({sortDir: dir, sortField: field})
  }

  _changeQuery(newquery) {
    let query = Object.assign({}, this.props.location.query || {})
    for(let k in newquery) {
      if(newquery[k] === null) { // removal
        delete query[k]
      } else {
        query[k] = newquery[k] // adding
      }
    }
    const serialized = Object.keys(query).reduce( (a,k) => {
      const val = typeof query[k] === 'object' ?
        JSON.stringify(query[k]) : encodeURIComponent(query[k])
      a.push(k + '=' + val)
      return a
    }, []).join('&')

    // TODO: use https://github.com/reactjs/react-router/blob/master/docs/API.md#createpathpathorloc-query
    browserHistory.push(`${this.props.location.pathname}?${serialized}`)
  }

  onPageChange(page) {
    this.props.state.updatePage(page)
    this._changeQuery({page: page})
  }

  onSelect(data) {
    this.props.state.updateSelection(data)
  }

}
