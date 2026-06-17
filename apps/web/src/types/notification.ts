export type NotificationItem = {
  id: string;
  type: 'confirm' | 'cancel' | 'info';
  message: string;
  time: string;
  read: boolean;
};
