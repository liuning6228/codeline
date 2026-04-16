"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ChatInput = function (_a) {
    var onSendMessage = _a.onSendMessage, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    var _c = (0, react_1.useState)(''), inputValue = _c[0], setInputValue = _c[1];
    var _d = (0, react_1.useState)(false), isComposing = _d[0], setIsComposing = _d[1];
    var handleInputChange = function (e) {
        setInputValue(e.target.value);
        // 自动调整高度
        e.target.style.height = 'auto';
        e.target.style.height = "".concat(e.target.scrollHeight, "px");
    };
    var handleSend = function () {
        if (!inputValue.trim() || disabled)
            return;
        onSendMessage(inputValue);
        setInputValue('');
        // 重置高度
        var textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.style.height = 'auto';
        }
    };
    var handleKeyDown = function (e) {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            handleSend();
        }
    };
    return (<div className="relative">
      <div className="relative">
        <textarea value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} onCompositionStart={function () { return setIsComposing(true); }} onCompositionEnd={function () { return setIsComposing(false); }} placeholder="Type your message here... Use @ to reference files, @problems to see issues, @workspace for context..." disabled={disabled} className="w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 pr-12 text-foreground placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" rows={1} style={{ minHeight: '44px', maxHeight: '200px' }}/>
        
        <div className="absolute bottom-2 right-2 flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {inputValue.length > 0 ? "".concat(inputValue.length, " chars") : ''}
          </span>
          
          <button onClick={handleSend} disabled={!inputValue.trim() || disabled} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50" title="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 快捷提示 */}
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="text-xs text-gray-500">Quick references:</span>
        <button type="button" className="rounded-full border border-border bg-secondary px-2 py-1 text-xs text-foreground hover:bg-secondary/80" onClick={function () { return setInputValue(function (prev) { return prev + '@file '; }); }}>
          @file
        </button>
        <button type="button" className="rounded-full border border-border bg-secondary px-2 py-1 text-xs text-foreground hover:bg-secondary/80" onClick={function () { return setInputValue(function (prev) { return prev + '@folder '; }); }}>
          @folder
        </button>
        <button type="button" className="rounded-full border border-border bg-secondary px-2 py-1 text-xs text-foreground hover:bg-secondary/80" onClick={function () { return setInputValue(function (prev) { return prev + '@problems '; }); }}>
          @problems
        </button>
        <button type="button" className="rounded-full border border-border bg-secondary px-2 py-1 text-xs text-foreground hover:bg-secondary/80" onClick={function () { return setInputValue(function (prev) { return prev + '@workspace '; }); }}>
          @workspace
        </button>
      </div>
    </div>);
};
exports.default = ChatInput;
