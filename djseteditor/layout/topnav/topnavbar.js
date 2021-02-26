import React from 'react'
import { Link, NavLink as RRNavLink } from 'react-router-dom'

import {
  Navbar,
  Nav,
  NavItem,
  NavLink
} from '../../../airframe/components'

const navLinks = ['tracks', 'mixes', 'sets']

export const TopNavbar = () => (
  <Navbar
    expand='sm'
    light
    color={'primary'}
    fluid
    className="bg-white pt-2 initial-loader bb-black-02 shadow-sm"
  >
    <NavItem className="navbar-brand">
      <Link to="/">
        <img
          src='/assets/soundwave-640x450px.jpg'
          height='48px'
          className='d-block'
          alt="DJ Set Editor Logo"
        />
      </Link>
    </NavItem>
    <h1 className="h5 mb-0 mr-auto ml-2 d-lg-block" >
      DJ Set Editor
    </h1>

    <Nav accent navbar>
      {navLinks.map(target => (
        <NavItem key={target}>
          <NavLink tag={RRNavLink} exact to={`/${target}`} activeClassName="active">
            {target.charAt(0).toUpperCase() + target.slice(1)}
          </NavLink>
        </NavItem>
      ))}
    </Nav>
  </Navbar >
)
