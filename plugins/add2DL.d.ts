/**
 * Abrantes dataLayer plugin - Google Tag Manager dataLayer integration
 * TypeScript type definitions
 */

import Abrantes from "../Abrantes";

/** DataLayer plugin settings */
interface DataLayerSettings {
    /** Event name pushed to dataLayer */
    eventName: string;
    /** Key name for the combined test-variant value */
    customDimension: string;
    /** Key name for the experiment/test name */
    experimentName: string;
    /** Key name for the variant name */
    variantName: string;
    /** Prefix for variant values (e.g., "v" results in "v0", "v1") */
    variantPrefix: string;
}

declare module "../Abrantes" {
    interface AbrantesSettings {
        dataLayer: DataLayerSettings;
    }

    interface Abrantes {
        /**
         * Pushes an event with test data to the dataLayer for tag manager integration
         * @param customDim - Custom dimension name for the test data, defaults to testId
         */
        add2dataLayer(customDim?: string): void;
    }
}

export {};
