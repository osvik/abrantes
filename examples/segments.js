// This file is for examples of segments as references for documentation.
// Each function returns true if the user is in the segment, and false otherwise.

// --- By browser language ---

() => {
    // Users whose browser language is Portuguese.
    const languages = navigator.languages || [navigator.language];
    return languages.some(language => language && language.toLowerCase().startsWith("pt"));
}

() => {
    // Users whose browser language is Portuguese or Spanish.
    const languages = navigator.languages || [navigator.language];
    const prefixes = ["pt", "es"];
    return languages.some(language =>
        language && prefixes.some(prefix => language.toLowerCase().startsWith(prefix))
    );
}


() => {
    // Users whose browser language is Portuguese or Spanish, and who are on a mobile device.
    const languages = navigator.languages || [navigator.language];
    const prefixes = ["pt", "es"];
    const isPortugueseOrSpanish = languages.some(language =>
        language && prefixes.some(prefix => language.toLowerCase().startsWith(prefix))
    );
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    return isPortugueseOrSpanish && isMobile;
}


// --- By hour of the day ---

() => {
    // Users visiting between 9:00 and 17:59 local time.
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17;
}

() => {
    // Users visiting between 9:00 and 17:59 UTC time.
    const hour = new Date().getUTCHours();
    return hour >= 9 && hour <= 17;
}


// --- By day of the week ---

() => {
    // Users visiting on weekdays (Monday to Friday).
    const day = new Date().getDay();
    return day >= 1 && day <= 5;
}

() => {
    // Users visiting on weekends (Saturday or Sunday).
    const day = new Date().getDay();
    return day === 0 || day === 6;
}


// --- By value in localStorage ---

() => {
    // Users whose localStorage "user_plan" equals "premium".
    try {
        const value = localStorage.getItem("user_plan");
        return value === "premium";
    } catch (error) {
        return false;
    }
}

() => {
    // Users whose localStorage "cart_total" is greater than 50.
    try {
        const value = localStorage.getItem("cart_total");
        return value !== null && parseFloat(value) > 50;
    } catch (error) {
        return false;
    }
}

() => {
    // Users whose localStorage "visit_count" is less than 3.
    try {
        const value = localStorage.getItem("visit_count");
        return value !== null && parseFloat(value) < 3;
    } catch (error) {
        return false;
    }
}


// --- By pointer type (desktop vs mobile/tablet) ---

() => {
    // Users on a device with a fine pointer (desktop with mouse).
    return window.matchMedia("(pointer: fine)").matches;
}

() => {
    // Users on a device with a coarse pointer (mobile or tablet with touch).
    return window.matchMedia("(pointer: coarse)").matches;
}


// --- By screen width (browser width) ---

() => {
    // Users with a browser width of 768px or less (mobile).
    return window.innerWidth <= 768;
}

() => {
    // Users with a browser width between 769px and 1024px (tablet).
    return window.innerWidth >= 769 && window.innerWidth <= 1024;
}

() => {
    // Users with a browser width greater than 1024px (desktop).
    return window.innerWidth > 1024;
}


// --- By UTM values ---

() => {
    // Users arriving from utm_source "google" and utm_medium "cpc".
    const params = new URLSearchParams(window.location.search);
    return params.get("utm_source") === "google" && params.get("utm_medium") === "cpc";
}

() => {
    // Users arriving from utm_source "facebook" and utm_medium "paid" or "cpc".
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    return source === "facebook" && (medium === "paid" || medium === "cpc");
}


// --- By document.referrer ---

() => {
    // Users whose referrer includes any of the specified domains.
    const referrerSources = ["google.com", "bing.com", "duckduckgo.com"];
    return referrerSources.some(source => document.referrer.includes(source));
}

() => {
    // Users whose referrer includes any of the specified social media domains.
    const socialDomains = ["facebook.com", "twitter.com", "linkedin.com", "instagram.com"];
    return socialDomains.some(domain => document.referrer.includes(domain));
}


// --- By event in the dataLayer ---

() => {
    // Users for whom a "purchase" event exists in the dataLayer.
    return Array.isArray(window.dataLayer) &&
        window.dataLayer.some(entry => entry && entry.event === "purchase");
}

() => {
    // Users for whom a "login" or "sign_up" event exists in the dataLayer.
    const events = ["login", "sign_up"];
    return Array.isArray(window.dataLayer) &&
        window.dataLayer.some(entry => entry && events.includes(entry.event));
}


// --- By property value in any previous dataLayer event ---

() => {
    // Users for whom any dataLayer event has user_type set to "returning".
    return Array.isArray(window.dataLayer) &&
        window.dataLayer.some(entry => entry && entry.user_type === "returning");
}

() => {
    // Users for whom any dataLayer event has a page_type of "product" or "category".
    const pageTypes = ["product", "category"];
    return Array.isArray(window.dataLayer) &&
        window.dataLayer.some(entry => entry && pageTypes.includes(entry.page_type));
}

() => {
    // Users for whom any dataLayer event has a nested ecommerce.value greater than 100.
    return Array.isArray(window.dataLayer) &&
        window.dataLayer.some(entry =>
            entry && entry.ecommerce && entry.ecommerce.value > 100
        );
}
