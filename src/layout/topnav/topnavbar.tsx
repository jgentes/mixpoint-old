import { Link, NavLink, useLocation } from 'react-router-dom'
import { Button, Navbar, Tabs, Tab } from '@blueprintjs/core'
import { Lightbulb } from '@blueprintjs/icons'
import { db } from '../../db'

//@ts-ignore
import light from 'url:../../assets/light.mp3'
import logo from 'url:../../assets/soundwave-596x419.png'

const navLinks = ['tracks', 'mixes', 'sets']

export const TopNavbar = (props: { layoutStyle: object }) => {
  const location = useLocation()
  const darkMode = document.body.classList.contains('bp4-dark')

  const darkSwitch = (
    <div style={{ paddingTop: '10px', paddingRight: '5px' }}>
      <Button
        minimal={true}
        icon={<Lightbulb />}
        onClick={() => {
          new Audio(light).play()
          db.appState.put(!darkMode, 'darkMode')
        }}
      />
    </div>
  )

  return (
    <Navbar
      style={{ height: '70px', padding: '10px 0' }}
      className='navbar-shadow'
    >
      <div style={props.layoutStyle}>
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
          <Tabs
            animate={true}
            id='navbar'
            large={true}
            selectedTabId={location.pathname?.split('/')[1]}
          >
            {navLinks.map(target => (
              <Tab
                className='header-nav-text'
                key={target}
                id={target}
                title={
                  <NavLink to={`/${target}`} style={{ padding: '0 15px' }}>
                    {target.charAt(0).toUpperCase() + target.slice(1)}
                  </NavLink>
                }
              />
            ))}
          </Tabs>
        </Navbar.Group>

        <Navbar.Group align='right'>{darkSwitch}</Navbar.Group>
      </div>
    </Navbar>
  )
}
