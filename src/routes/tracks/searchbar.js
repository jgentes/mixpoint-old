import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Input, InputGroup, Button, InputGroupAddon } from 'reactstrap'

export const SearchBar = props => {
  SearchBar.propTypes = {
    className: PropTypes.string,
    onSearch: PropTypes.func
  }

  const [searchVal, setSearch] = useState('')

  useEffect(() => props.onSearch(searchVal), [searchVal])

  return (
    <InputGroup className={props.className} size='sm'>
      <InputGroupAddon addonType='prepend'>
        <i className='input-group-text w-auto fa fa-search fa-fw'></i>
      </InputGroupAddon>
      <Input
        onChange={e => {
          setSearch(e.target.value)
        }}
        value={searchVal}
        className='bg-white'
        placeholder='Type to search...'
      />
      {searchVal && (
        <InputGroupAddon addonType='append'>
          <Button
            outline
            onClick={() => {
              setSearch('')
            }}
          >
            <i className='fa fa-fw fa-times'></i>
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
