import { mockReservations } from '../data/reservations';
import { RESERVATION_STATUS } from '../constants/orderStatus';

export const RESERVATION_ACTIONS = {
  HYDRATE: 'HYDRATE',
  CREATE: 'CREATE',
  CANCEL: 'CANCEL',
  SET_STATUS: 'SET_STATUS',
};

export const initialReservationsState = { reservations: mockReservations };

const setStatus = (reservations, id, status) =>
  reservations.map((r) => (r.id === id ? { ...r, status } : r));

export function reservationsReducer(state, action) {
  switch (action.type) {
    case RESERVATION_ACTIONS.HYDRATE:
      return { ...initialReservationsState, ...action.payload };

    case RESERVATION_ACTIONS.CREATE:
      return { ...state, reservations: [...state.reservations, action.payload] };

    case RESERVATION_ACTIONS.CANCEL:
      return {
        ...state,
        reservations: setStatus(state.reservations, action.payload.id, RESERVATION_STATUS.CANCELLED),
      };

    case RESERVATION_ACTIONS.SET_STATUS:
      return {
        ...state,
        reservations: setStatus(state.reservations, action.payload.id, action.payload.status),
      };

    default:
      return state;
  }
}

export default reservationsReducer;
