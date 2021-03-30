import { useEffect, useState } from 'react'
import { Input, InputGroup, Button, InputGroupAddon } from 'reactstrap'

export const SearchBar = (props: {
  className?: string
  onSearch: (searchVal: string) => void
}): JSX.Element => {
  const [searchVal, setSearch] = useState('')

  useEffect(() => props.onSearch(searchVal), [searchVal])

  return (
    <InputGroup className={props.className} size='sm'>
      <InputGroupAddon addonType='prepend'>
        <i className='input-group-text w-auto las la-search la-fw'></i>
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
            <i className='las la-fw la-times'></i>
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
