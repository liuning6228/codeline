/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)'],
        base: ['var(--font-base)'],
      },
      colors: {
        cline: 'var(--color-cline)',
        background: 'var(--vscode-sideBar-background)',
        border: {
          DEFAULT: 'var(--vscode-focusBorder)',
          panel: 'var(--vscode-panel-border)',
        },
        foreground: 'var(--vscode-foreground)',
        shadow: 'var(--vscode-widget-shadow)',
        code: {
          DEFAULT: 'var(--vscode-editor-background)',
          foreground: 'var(--vscode-editor-foreground)',
          border: 'var(--vscode-editor-border)',
          block: {
            background: 'var(--color-code-block-background)',
          },
        },
        sidebar: {
          DEFAULT: 'var(--vscode-sideBar-background)',
          foreground: 'var(--vscode-sideBar-foreground)',
        },
        input: {
          foreground: 'var(--vscode-input-foreground)',
          DEFAULT: 'var(--vscode-input-background)',
          border: 'var(--vscode-input-border)',
          placeholder: 'var(--vscode-input-placeholderForeground)',
        },
        selection: {
          DEFAULT: 'var(--vscode-list-activeSelectionBackground)',
          foreground: 'var(--vscode-list-activeSelectionForeground)',
        },
        button: {
          DEFAULT: 'var(--vscode-button-background)',
          hover: 'var(--vscode-button-hoverBackground)',
          foreground: 'var(--vscode-button-foreground)',
          separator: 'var(--vscode-button-separator)',
          secondary: {
            DEFAULT: 'var(--vscode-button-secondaryBackground)',
            hover: 'var(--vscode-button-secondaryHoverBackground)',
            foreground: 'var(--vscode-button-secondaryForeground)',
          },
        },
        muted: {
          DEFAULT: 'color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 65%, transparent)',
          foreground: 'var(--vscode-editor-foldPlaceholderForeground)',
        },
        menu: {
          DEFAULT: 'var(--vscode-menu-background)',
          foreground: 'var(--vscode-menu-foreground)',
          border: 'var(--vscode-menu-border)',
          shadow: 'var(--vscode-menu-shadow)',
        },
        link: {
          DEFAULT: 'var(--vscode-textLink-foreground)',
          hover: 'var(--vscode-textLink-activeForeground)',
        },
        list: {
          hover: 'var(--vscode-list-hoverBackground)',
        },
        badge: {
          foreground: 'var(--vscode-badge-foreground)',
          DEFAULT: 'var(--vscode-badge-background)',
        },
        toolbar: {
          DEFAULT: 'var(--vscode-toolbar-background)',
          hover: 'var(--vscode-toolbar-hoverBackground)',
        },
        error: 'var(--vscode-errorForeground)',
        description: 'var(--vscode-descriptionForeground)',
        success: 'var(--vscode-charts-green)',
        warning: 'var(--vscode-charts-yellow)',
        diff: {
          added: 'var(--vscode-diffEditor-insertedTextBackground)',
          removed: 'var(--vscode-diffEditor-removedTextBackground)',
        },
        preformat: 'var(--vscode-textPreformat-foreground)',
        quote: {
          DEFAULT: 'var(--vscode-textBlockQuote-background)',
          foreground: 'var(--vscode-textBlockQuote-foreground)',
        },
      },
      fontSize: {
        '2xl': 'var(--text-2xl)',
        xl: 'var(--text-xl)',
        lg: 'var(--text-lg)',
        md: 'var(--text-md)',
        base: 'var(--text-base)',
        sm: 'var(--text-sm)',
        xs: 'var(--text-xs)',
        xxs: 'var(--text-xxs)',
        editor: 'var(--text-editor-size)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'cursor-blink': 'cursorBlink 1s ease-in-out infinite',
        'icon-pulse': 'iconPulse 1s ease-in-out infinite',
        'shimmer': 'shimmer 5s infinite linear',
        'fade-slide-in': 'fadeSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        flash: 'flash 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        cursorBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        iconPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      spacing: {
        '1': 'var(--size-1)',
        '2': 'var(--size-2)',
        '3': 'var(--size-3)',
        '4': 'var(--size-4)',
        '5': 'var(--size-5)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
