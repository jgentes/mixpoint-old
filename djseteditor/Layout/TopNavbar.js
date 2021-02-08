import React from 'react';
import { Link } from 'react-router-dom';

import {
  Navbar,
  Nav,
  NavItem,
  NavLink
} from '../../airframe/components';

export const TopNavbar = () => (
  <Navbar
    expand="sm"
    light
    color={'primary'}
    fluid
    className="bg-white pt-2 initial-loader border-bottom"
  >
    <NavItem className="navbar-brand">
      <Link to="/">
        <img
          src={require('../assets/soundwave-640x450px.jpg')}
          height='48px'
          className='d-block'
          alt="Logo"
        />
      </Link>
    </NavItem>
    <h1 className="h5 mb-0 mr-auto ml-2 d-lg-block" >
      DJ Set Editor
    </h1>

    <Nav accent navbar>
      <NavItem>
        <NavLink
          active
          tag={Link}
          to="/layouts/sidebar-with-navbar"
        >
          Preview
                                </NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="/">
          Docs
                                </NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="/">
          Code
                                </NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="/">
          Buy
                                </NavLink>
      </NavItem>
    </Nav>
  </Navbar >
)