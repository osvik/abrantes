/**
 * Abrantes - A lightweight A/B testing library
 * TypeScript type definitions
 */

/** Settings for cross-site link functionality */
interface CrossSiteLinkSettings {
    /** Event to trigger link transformation (e.g., "DOMContentLoaded") */
    triggerEvent: string;
}

/** Settings for cookie storage */
interface CookieSettings {
    /** Number of days until the cookie expires */
    expires: number;
    /** Cookie path */
    path: string;
    /** Cookie domain (empty string uses current domain) */
    domain: string;
}

/** Core settings object */
interface AbrantesSettings {
    crossSiteLink: CrossSiteLinkSettings;
    cookie: CookieSettings;
}

/** Variant function type */
type VariantFunction = () => void;

/** Segment function type - returns true if user should be included in test */
type SegmentFunction = () => boolean;

/** Storage context types */
type PersistContext = "user" | "local" | "session" | "cookie";

/** Main Abrantes interface */
interface Abrantes {
    /** Library version */
    readonly version: string;

    /** Current test identifier */
    testId: string | undefined;

    /** Current variant index (-1 means control/excluded) */
    variant: number | undefined;

    /** Array of variant indices to exclude when assigning new users */
    excludedVariantsForNewUsers: number[];

    /** Configuration settings */
    settings: AbrantesSettings;

    /** Array of variant functions */
    variants: VariantFunction[];

    /**
     * Assigns a variant to a user based on traffic allocation and segmentation
     * @param testId - String identifier for the test
     * @param trafficAllocation - Percentage of users to include (0-1), defaults to 1
     * @param segment - Function that returns true to include user, defaults to () => true
     */
    assignVariant(
        testId: string,
        trafficAllocation?: number,
        segment?: SegmentFunction
    ): void;

    /**
     * Imports the variant from the URL query parameters
     * @param testId - Identifier for the test, used as the URL parameter name
     */
    importVariant(testId: string): void;

    /**
     * Adds the test ID and variant to a URL for cross-domain experiments
     * @param linkURLstring - The target URL to append parameters to
     * @returns The modified URL with test parameters
     */
    makeCrossSiteURL(linkURLstring: string): string;

    /**
     * Transforms the href attributes of matching anchor elements for cross-site experiments
     * @param selector - CSS selector to match anchor elements
     */
    crossSiteLink(selector: string): void;

    /**
     * Executes the variant function and adds a class to the body element
     * @param variant - The variant index to render, defaults to this.variant
     */
    renderVariant(variant?: number): void;

    /**
     * Stores the test ID and variant in the specified storage mechanism
     * @param context - Storage type: "user"/"local" for localStorage, "session" for sessionStorage, "cookie" for cookies
     */
    persist(context?: PersistContext): void;

    /**
     * Reads the persisted variant from storage (checks session, local, then cookie)
     * @returns The stored variant index, or undefined if not found
     */
    readPersistent(): number | undefined;

    /**
     * Selects a random variant from the list of available variants
     * @returns The randomly selected variant index
     */
    getRandomVar(): number;

    /**
     * Redirects to another URL while preserving query parameters and hash
     * @param url - The destination URL to redirect to
     */
    redirectTo(url: string): void;

    /**
     * Waits for an element to appear in the DOM using MutationObserver
     * @param selector - CSS selector for the element to wait for
     * @param callback - Function to execute when the element is found
     */
    waitFor(selector: string, callback: () => void): void;

    /**
     * Tracks the user (requires a plugin to implement)
     * @throws Error if no tracking plugin is loaded
     */
    track(...args: unknown[]): void;
}

declare const Abrantes: Abrantes;

export = Abrantes;
export as namespace Abrantes;
