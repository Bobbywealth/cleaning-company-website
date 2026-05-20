import React from 'react';
import { Outlet } from 'react-router-dom';
import LiveChat from './LiveChat';
import ServiceAreaMap from './ServiceAreaMap';

function Layout() {
  return (
    <>
      <Outlet />
      <ServiceAreaMap />
      <LiveChat />
    </>
  );
}

export default Layout;