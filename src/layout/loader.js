import PropTypes from 'prop-types'

const Loader = props => {
  return (
    <div className={`loader ${props.className}`} style={props.style}>
      <div className='bar1'></div>
      <div className='bar2'></div>
      <div className='bar3'></div>
      <div className='bar4'></div>
      <div className='bar5'></div>
      <div className='bar6'></div>
    </div>
  )
}

Loader.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
}

export default Loader
