import { useEffect, useState } from 'react';

// Small signals that let separate parts of the page react to logging in or out
// without reloading: the login window, the navbar, and the product page chat.
export const AUTH_EVENT = 'rr-auth-changed';
export const OPEN_LOGIN_EVENT = 'rr-open-login';

// Call after the token has been saved (or removed).
export const announceAuthChange = () => window.dispatchEvent(new Event(AUTH_EVENT));

// Ask the navbar to open its login window from anywhere on the page.
export const requestLogin = () => window.dispatchEvent(new Event(OPEN_LOGIN_EVENT));

const hasToken = () => {
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
};

// True while a login token exists, and updates the moment someone logs in or out.
export function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(hasToken);
  useEffect(() => {
    const sync = () => setLoggedIn(hasToken());
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return loggedIn;
}
