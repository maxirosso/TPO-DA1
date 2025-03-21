import {
    AUTH_LOADING,
    AUTH_SUCCESS,
    AUTH_ERROR,
    AUTH_LOGOUT
  } from '../actions/authActions';
  
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };
  
  export default function authReducer(state = initialState, action) {
    switch (action.type) {
      case AUTH_LOADING:
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case AUTH_SUCCESS:
        return {
          ...state,
          user: action.payload,
          isAuthenticated: true,
          loading: false,
          error: null
        };
        
      case AUTH_ERROR:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
        
      case AUTH_LOGOUT:
        return {
          ...initialState
        };
        
      default:
        return state;
    }
  }