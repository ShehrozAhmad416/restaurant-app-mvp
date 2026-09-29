import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

// Lets any screen reset the ROOT stack (e.g. login -> Main, logout -> Login),
// even from inside a nested tab/stack navigator.
export const navigationRef = createNavigationContainerRef();

export function resetRoot(name, params) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name, params }] }));
}
