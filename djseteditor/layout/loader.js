import React from 'react'
import classNames from 'classnames'

const Loader = props => {
  const loaderClass = classNames(
    'loader',
    props.className
  )

  return (
    <div className={loaderClass} hidden={props.hidden}>
      <div className="bar1"></div>
      <div className="bar2"></div>
      <div className="bar3"></div>
      <div className="bar4"></div>
      <div className="bar5"></div>
      <div className="bar6"></div>
    </div>
  )
}

Loader.propTypes = {
  className: String,
  hidden: Boolean
}

export default Loader
