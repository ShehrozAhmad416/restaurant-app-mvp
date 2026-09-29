import { Alert, Platform } from 'react-native';

// Alert.alert with buttons does nothing on web, so fall back to window.confirm there.
export function confirmAction({ title, message, confirmText = 'OK', cancelText = 'Cancel', destructive = false, onConfirm }) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

// Simple one-button message (used for login / signup failures).
export function showMessage(title, message) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
