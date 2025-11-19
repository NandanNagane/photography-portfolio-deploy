import { createContext } from 'react';

export const NavContext = createContext({
  isNavHidden: false,
  setIsNavHidden: () => {},
});
