import React from 'react';
import { Link, NavLink as RRNavLink } from 'react-router-dom';

import {
  Navbar,
  Nav,
  NavItem,
  NavLink
} from '../../airframe/components';

export const TopNavbar = () => (
  <Navbar
    expand='sm'
    light
    color={'primary'}
    fluid
    className="bg-white pt-2 initial-loader bb-black-03"
  >
    <NavItem className="navbar-brand">
      <Link to="/">
        <img
          src={require('../assets/soundwave-640x450px.jpg')}
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
      <NavItem>
        <NavLink tag={RRNavLink} exact to="/tracks" activeClassName="active">
          Tracks
                                </NavLink>
      </NavItem>
      <NavItem>
        <NavLink tag={RRNavLink} exact to="/mixes" activeClassName="active">
          Mixes
                                </NavLink>
      </NavItem>
      <NavItem>
        <NavLink tag={RRNavLink} exact to="/sets" activeClassName="active">
          Sets
                                </NavLink>
      </NavItem>
    </Nav>
  </Navbar >
)