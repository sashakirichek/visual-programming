import { useNotification } from "../context/NotificationContext";
import "./NotificationContainer.css";

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
