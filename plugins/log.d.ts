/**
 * Abrantes log plugin - Custom logging API integration
 * TypeScript type definitions
 */

import Abrantes from "../Abrantes";

/** Log plugin settings */
interface LogSettings {
    /** URL of the logging API endpoint */
    apiURL: string;
    /** Prefix for variant values (e.g., "v" results in "v0", "v1") */
    variantPrefix: string;
}

declare module "../Abrantes" {
    interface AbrantesSettings {
        log: LogSettings;
    }

    interface Abrantes {
        /**
         * Sends an event to the Abrantes Log API
         * @param event - Event name to log
         * @param note - Optional note, defaults to empty string
         */
        log(event: string, note?: string): void;
    }
}

export {};
