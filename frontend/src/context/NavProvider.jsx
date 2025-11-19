import React, { useState } from 'react';
import { NavContext } from './NavContext';

export const NavProvider = ({ children }) => {
  const [isNavHidden, setIsNavHidden] = useState(false);

  return (
    <NavContext.Provider value={{ isNavHidden, setIsNavHidden }}>
      {children}
    </NavContext.Provider>
  );
};
