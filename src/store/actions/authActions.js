import { authService } from '../../services/auth';

// Action Types
export const AUTH_LOADING = 'AUTH_LOADING';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_ERROR = 'AUTH_ERROR';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';

// Action Creators
export const loginUser = (email, password) => async (dispatch) => {
  dispatch({ type: AUTH_LOADING });
  
  try {
    const result = await authService.login(email, password);
    dispatch({
      type: AUTH_SUCCESS,
      payload: result.user,
      token: result.token
    });
    return result;
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
      payload: error.message || 'Login failed'
    });
    throw error;
  }
};

export const registerUser = (userData) => async (dispatch) => {
  dispatch({ type: AUTH_LOADING });
  
  try {
    const result = await authService.register(userData);
    dispatch({
      type: AUTH_SUCCESS,
      payload: result.user,
      token: result.token
    });
    return result;
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
      payload: error.message || 'Registration failed'
    });
    throw error;
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await authService.logout();
    dispatch({ type: AUTH_LOGOUT });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const checkAuthState = () => async (dispatch) => {
  dispatch({ type: AUTH_LOADING });
  
  try {
    const isAuthenticated = await authService.isAuthenticated();
    
    if (isAuthenticated) {
      const user = await authService.getCurrentUser();
      dispatch({
        type: AUTH_SUCCESS,
        payload: user
      });
    } else {
      dispatch({ type: AUTH_LOGOUT });
    }
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
      payload: error.message || 'Auth check failed'
    });
  }
};