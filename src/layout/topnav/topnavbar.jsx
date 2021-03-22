import React from 'react'
import { Link, NavLink as RRNavLink } from 'react-router-dom'
import { NavLink, NavItem, Nav, Navbar } from 'reactstrap'

import logo from '../../assets/soundwave-640x450px.jpg'
const navLinks = ['tracks', 'mixes', 'sets']

export const TopNavbar = () => (
  <Navbar
    expand='sm'
    light
    color={'primary'}
    className='bg-white pt-2 initial-loader bb-black-02 shadow-sm'
  >
    <div className='navbar-collapse-wrap container-fluid'>
      <NavItem className='navbar-brand'>
        <Link to='/'>
          <img
            src={logo}
            height='48px'
            className='d-block'
            alt='DJ Set Editor Logo'
            id='headerLogo'
          />
        </Link>
      </NavItem>
      <h1 className='h5 mb-0 mr-auto ml-2 d-lg-block' title='site title'>
        DJ Set Editor
      </h1>

      <Nav className='nav-accent navbar-nav'>
        {navLinks.map(target => (
          <NavItem key={target}>
            <NavLink
              tag={RRNavLink}
              exact
              to={`/${target}`}
              activeClassName='active'
            >
              {target.charAt(0).toUpperCase() + target.slice(1)}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
    </div>
  </Navbar>
)
