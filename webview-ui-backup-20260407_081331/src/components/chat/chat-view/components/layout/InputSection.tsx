/**
 * InputSection - Chat input section with textarea and controls
 */

import React, { useRef, useCallback } from 'react';

interface InputSectionProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  placeholderText: string;
  sendingDisabled: boolean;
  onSend: () => void;
  selectedImages?: string[];
  selectedFiles?: string[];
  onRemoveImage?: (index: number) => void;
  onRemoveFile?: (index: number) => void;
  mode: 'plan' | 'act';
  onModeChange?: (mode: 'plan' | 'act') => void;
  textAreaRef?: React.RefObject<HTMLTextAreaElement>;
}

export const InputSection: React.FC<InputSectionProps> = ({
  inputValue,
  setInputValue,
  placeholderText,
  sendingDisabled,
  onSend,
  selectedImages = [],
  selectedFiles = [],
  onRemoveImage,
  onRemoveFile,
  mode,
  onModeChange,
  textAreaRef: externalRef,
}) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef = externalRef || internalRef;

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendingDisabled) {
        onSend();
      }
    }
  }, [sendingDisabled, onSend]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, [setInputValue]);

  return (
    <div className="border-t border-border p-3 bg-sidebar">
      {/* Selected Images/Files Preview */}
      {(selectedImages.length > 0 || selectedFiles.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedImages.map((img, index) => (
            <div key={`img-${index}`} className="relative group">
              <img
                src={img}
                alt={`Selected ${index + 1}`}
                className="w-12 h-12 object-cover rounded border border-border"
              />
              {onRemoveImage && (
                <button
                  className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveImage(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {selectedFiles.map((file, index) => (
            <div key={`file-${index}`} className="relative group flex items-center gap-1 px-2 py-1 bg-code rounded border border-border text-xs">
              <span className="truncate max-w-24">{file}</span>
              {onRemoveFile && (
                <button
                  className="text-description hover:text-foreground"
                  onClick={() => onRemoveFile(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textAreaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={sendingDisabled}
            className="w-full resize-none bg-input text-foreground border border-input-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-button disabled:opacity-50 min-h-[36px] max-h-32"
            rows={1}
          />
        </div>

        {/* Mode Toggle */}
        {onModeChange && (
          <ModeToggle mode={mode} onModeChange={onModeChange} disabled={sendingDisabled} />
        )}

        {/* Send Button */}
        <button
          className="px-3 py-2 bg-button text-button-foreground rounded-md text-sm font-medium hover:bg-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSend}
          disabled={sendingDisabled || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Mode Toggle Component
const ModeToggle: React.FC<{
  mode: 'plan' | 'act';
  onModeChange: (mode: 'plan' | 'act') => void;
  disabled?: boolean;
}> = ({ mode, onModeChange, disabled }) => {
  return (
    <div className="flex items-center border border-border rounded-md overflow-hidden">
      <button
        className={`px-2 py-1 text-xs font-medium transition-colors ${
          mode === 'plan' 
            ? 'bg-warning text-black' 
            : 'bg-transparent text-description hover:bg-muted'
        }`}
        onClick={() => onModeChange('plan')}
        disabled={disabled}
      >
        Plan
      </button>
      <button
        className={`px-2 py-1 text-xs font-medium transition-colors ${
          mode === 'act' 
            ? 'bg-button text-button-foreground' 
            : 'bg-transparent text-description hover:bg-muted'
        }`}
        onClick={() => onModeChange('act')}
        disabled={disabled}
      >
        Act
      </button>
    </div>
  );
};

export default InputSection;
