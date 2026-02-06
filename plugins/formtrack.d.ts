/**
 * Abrantes formtrack plugin - Form field tracking integration
 * TypeScript type definitions
 */

import Abrantes from "../Abrantes";

/** Form tracking plugin settings */
interface FormTrackSettings {
    /** Events that trigger populating the form field */
    triggerEvents: string[];
    /** CSS selector for the input element to populate */
    inputElement: string;
}

declare module "../Abrantes" {
    interface AbrantesSettings {
        formTrack: FormTrackSettings;
    }

    interface Abrantes {
        /**
         * Sets up listeners to populate a form field with test data
         */
        formTrack(): void;

        /**
         * Sets a form input value with the test ID and variant
         * @param selector - CSS selector for the input element
         * @param testId - The test identifier
         * @param variant - The variant index
         */
        setInput(selector: string, testId: string, variant: number): void;
    }
}

export {};
