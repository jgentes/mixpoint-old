import { Link, NavLink } from 'react-router-dom'
import { Navbar, Tabs, Tab } from '@blueprintjs/core'

import logo from 'url:../../assets/soundwave-640x450px.jpg'
const navLinks = ['tracks', 'mixes', 'sets']

export const TopNavbar = () => (
  <Navbar style={{ height: '70px', padding: '10px' }} className='navbar-shadow'>
    <div style={{ width: '80%', margin: '0 auto' }}>
      <Navbar.Group>
        <Link to='/'>
          <img
            src={logo}
            height='48px'
            alt='MixPoint Logo'
            style={{ marginRight: '5px' }}
            id='headerLogo'
          />
        </Link>
        <div className='initial-loader__row initial-loader'>
          <h1>MixPoint</h1>
        </div>
      </Navbar.Group>

      <Navbar.Group align='right'>
        <Tabs
          animate={true}
          id='navbar'
          defaultSelectedTabId='mixes'
          large={true}
        >
          {navLinks.map(target => (
            <Tab
              className='header-nav-text'
              key={target}
              id={target}
              title={
                <NavLink exact to={`/${target}`}>
                  <span style={{ padding: '0 15px' }}>
                    {target.charAt(0).toUpperCase() + target.slice(1)}
                  </span>
                </NavLink>
              }
            />
          ))}
        </Tabs>
      </Navbar.Group>
    </div>
  </Navbar>
)
