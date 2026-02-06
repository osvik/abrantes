/**
 * Abrantes Clarity plugin - Microsoft Clarity integration
 * TypeScript type definitions
 */

import Abrantes from "../Abrantes";

/** Clarity plugin settings */
interface ClaritySettings {
    /** Events that trigger the Clarity tag (e.g., cookie acceptance events) */
    triggerEvents: string[];
}

declare module "../Abrantes" {
    interface AbrantesSettings {
        clarity: ClaritySettings;
    }

    interface Abrantes {
        /**
         * Sets up listeners to send test data to Microsoft Clarity
         */
        clarity(): void;
    }
}

export {};
