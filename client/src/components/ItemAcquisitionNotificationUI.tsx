import React, { useEffect, useState } from 'react';
import { NotificationItem } from '../types/notifications';
import { itemIcons } from '../utils/itemIconUtils'; // Assuming you have this for item icons

interface ItemAcquisitionNotificationUIProps {
  notifications: NotificationItem[];
  hasActiveCrafting?: boolean;
  hasActiveStatusEffects?: boolean; // New prop to track if status effects are showing
}

const MAX_NOTIFICATIONS = 5;
const NOTIFICATION_TIMEOUT_MS = 3000; // Notifications stay for 3 seconds

const ItemAcquisitionNotificationUI: React.FC<ItemAcquisitionNotificationUIProps> = ({ 
  notifications,
  hasActiveCrafting = false,
  hasActiveStatusEffects = false // New prop with default false
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Update visible notifications when the prop changes
    // Display latest MAX_NOTIFICATIONS
    setVisibleNotifications(notifications.slice(-MAX_NOTIFICATIONS));
  }, [notifications]);

  if (visibleNotifications.length === 0) {
    return null;
  }

  // Calculate dynamic positioning based on whether there's active crafting and status effects
  const getBottomPosition = (): string => {
    if (hasActiveStatusEffects) {
      // Position above the status effects panel (which is at 140px from bottom)
      // StatusEffectsPanel is at bottom: '140px', so we need to be above it
      if (hasActiveCrafting) {
        return '250px'; // Higher if both status effects and crafting are active
      } else {
        return '200px'; // Position above status effects panel
      }
    } else {
      // No status effects active - position lower for better visibility
      if (hasActiveCrafting) {
        return '180px'; // Still need to be above crafting notification
      } else {
        return '140px'; // Higher position when no status effects - not too low
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: getBottomPosition(),
      right: '15px',
      display: 'flex',
      flexDirection: 'column-reverse', // New items appear at the bottom and push others up
      alignItems: 'flex-end',
      zIndex: 100, // Ensure it's above other UI elements but below modals perhaps
    }}>
      {visibleNotifications.map((notif, index) => {
        const isMostRecent = index === visibleNotifications.length - 1;
        const isPositive = notif.quantityChange > 0;
        // Apply 'fading-out' class if isFadingOut is true
        const itemClassName = `notification-item ${notif.isFadingOut ? 'fading-out' : ''}`;
        return (
          <div
            key={notif.id}
            className={itemClassName} // Use dynamic class name
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              backgroundColor: isMostRecent ? 'rgba(0, 10, 20, 0.95)' : 'rgba(0, 5, 15, 0.9)',
              color: '#00ffff',
              padding: '8px 12px',
              borderRadius: '2px',
              border: isMostRecent 
                ? `1px solid ${isPositive ? '#00ffff' : '#ff3366'}` 
                : `1px solid ${isPositive ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 51, 102, 0.4)'}`,
              marginBottom: '6px',
              boxShadow: isMostRecent 
                ? `0 0 15px ${isPositive ? 'rgba(0, 255, 255, 0.6)' : 'rgba(255, 51, 102, 0.6)'}, inset 0 0 20px rgba(0, 255, 255, 0.05)` 
                : 'inset 0 0 20px rgba(0, 255, 255, 0.03)',
              fontFamily: "'Courier New', 'Consolas', 'Monaco', monospace",
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '200px',
              transition: 'all 0.3s ease-out',
              backdropFilter: 'blur(4px)',
              overflow: 'hidden',
            }}
          >
            {/* Scanline effect overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
              pointerEvents: 'none',
              zIndex: 1,
            }} />

            {/* Icon container with glow */}
            <div style={{
              width: '24px',
              height: '24px',
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              borderRadius: '2px',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              boxShadow: isMostRecent ? '0 0 8px rgba(0, 255, 255, 0.4)' : 'none',
              position: 'relative',
              zIndex: 2,
            }}>
              <img 
                src={itemIcons[notif.itemIcon] || itemIcons['unknown']}
                alt={notif.itemName}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  imageRendering: 'pixelated',
                  filter: isMostRecent ? 'drop-shadow(0 0 2px rgba(0, 255, 255, 0.6))' : 'none',
                }}
              />
            </div>

            {/* Text content */}
            <span style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ 
                  color: isPositive ? '#00ff88' : '#ff3366',
                  textShadow: isMostRecent 
                    ? `0 0 8px ${isPositive ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 51, 102, 0.8)'}` 
                    : 'none',
                }}>
                  {`${notif.quantityChange > 0 ? '+' : ''}${notif.quantityChange}`}
                </span>
                {' '}
                <span style={{ 
                  color: '#00ffff',
                  textShadow: isMostRecent ? '0 0 6px rgba(0, 255, 255, 0.6)' : 'none',
                }}>
                  {notif.itemName}
                </span>
                {notif.currentTotalInInventory !== undefined && (
                    <span style={{ 
                      color: 'rgba(0, 255, 255, 0.6)', 
                      marginLeft: '6px',
                      fontSize: '10px',
                    }}>
                      {`[${notif.currentTotalInInventory}]`}
                    </span>
                )}
            </span>

            {/* Corner accent (top-right) */}
            {isMostRecent && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '8px',
                height: '8px',
                borderTop: `2px solid ${isPositive ? '#00ffff' : '#ff3366'}`,
                borderRight: `2px solid ${isPositive ? '#00ffff' : '#ff3366'}`,
                zIndex: 2,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Define keyframes and classes for animations
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeOutUp {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }

  .notification-item {
    /* Default styles are applied via inline style prop */
    /* Animation for fade-in is applied by default */
    animation: fadeInUp 0.5s ease-out forwards;
  }

  .notification-item.fading-out {
    animation: fadeOutUp 0.5s ease-out forwards;
  }
`;

// Inject styles into the document head
// This is a common pattern for component-specific global styles if not using CSS-in-JS or modules
if (!document.getElementById('item-acquisition-notification-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'item-acquisition-notification-styles';
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default React.memo(ItemAcquisitionNotificationUI); 