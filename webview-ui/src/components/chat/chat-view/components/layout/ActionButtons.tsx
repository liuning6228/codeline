/**
 * ActionButtons - Action buttons for task control
 */

import React from 'react';

interface ActionButtonsProps {
  isProcessing: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  onClear?: () => void;
  showCancel?: boolean;
  showRetry?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isProcessing,
  onCancel,
  onRetry,
  onClear,
  showCancel = true,
  showRetry = false,
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-sidebar">
      {isProcessing && showCancel && onCancel && (
        <button
          className="px-2 py-1 text-xs bg-button-secondary text-button-secondary-foreground rounded hover:bg-button-secondary-hover transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
      
      {!isProcessing && showRetry && onRetry && (
        <button
          className="px-2 py-1 text-xs bg-button-secondary text-button-secondary-foreground rounded hover:bg-button-secondary-hover transition-colors"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
      
      {!isProcessing && onClear && (
        <button
          className="px-2 py-1 text-xs text-description hover:text-foreground transition-colors"
          onClick={onClear}
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
