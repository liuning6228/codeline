export type LanguageKey = "en" | "ar" | "pt-BR" | "cs" | "fr" | "de" | "hi" | "hu" | "it" | "ja" | "ko" | "pl" | "pt-PT" | "ru" | "zh-CN" | "es" | "zh-TW" | "tr";
export type LanguageDisplay = "English" | "Arabic - العربية" | "Portuguese - Português (Brasil)" | "Czech - Čeština" | "French - Français" | "German - Deutsch" | "Hindi - हिन्दी" | "Hungarian - Magyar" | "Italian - Italiano" | "Japanese - 日本語" | "Korean - 한국어" | "Polish - Polski" | "Portuguese - Português (Portugal)" | "Russian - Русский" | "Simplified Chinese - 简体中文" | "Spanish - Español" | "Traditional Chinese - 繁體中文" | "Turkish - Türkçe";
export declare const DEFAULT_LANGUAGE_SETTINGS: LanguageKey;
export declare const languageOptions: {
    key: LanguageKey;
    display: LanguageDisplay;
}[];
export declare function getLanguageKey(display: LanguageDisplay | undefined): LanguageKey;
//# sourceMappingURL=Languages.d.ts.map