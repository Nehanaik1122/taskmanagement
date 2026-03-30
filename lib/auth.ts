export const auth = {
  login: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuth', 'true');
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuth');
    }
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isAuth') === 'true';
  },
};