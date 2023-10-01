/* jshint esversion:6 */

Abrantes = Object.create(null);

Abrantes.testId = undefined;
Abrantes.variant = undefined;

/**
 * Assigns a variant to a user
 * @param {string} testId 
 */
Abrantes.assignVariant = function (testId, trafficAllocation = 1) {
    if (typeof (testId) !== "string" || testId.length === 0) {
        throw ("You need to provide an ID when assigning a variant");
    }
    this.testId = testId;
    if (typeof (this.readPersistent()) === "number") {
        this.variant = this.readPersistent();
        return;
    }
    const n = Math.random();
    if (n > trafficAllocation) {
        this.variant = -1;
    } else {
        this.variant = this.randomVar();
    }
};

/**
 * Renders the variant and adds the class variant-x to the <body> tag
 * @param {Number} variant 
 */
Abrantes.renderVariant = function (variant = this.variant) {
    if (typeof (this.variants[variant]) === "function") {
        this.variants[variant]();
        document.getElementsByTagName("body")[0].classList.add(this.testId + "-" + variant);
    } else {
        throw ("The variant " + variant + " does not exist");
    }
};

/**
 * Stores the test id (object name) and variant in localStorage
 */
Abrantes.persist = function (context) {
    if (context === "user") {
        localStorage.setItem(this.testId, this.variant);
    } else if (context === "session") {
        sessionStorage.setItem(this.testId, this.variant);
    } else {
        throw ("You must use either 'user' or 'session'");
    }
};

/**
 * Reads the value in the storage
 * @returns 
 */
Abrantes.readPersistent = function () {
    const sessionData = sessionStorage.getItem(this.testId);
    if (typeof (sessionData) === "string" || typeof (sessionData) === "number") {
        return Number(sessionData);
    }
    const userData = localStorage.getItem(this.testId);
    if (typeof (userData) === "string" || typeof (userData) === "number") {
        return Number(userData);
    }
    return undefined;
};

/**
 * Object where the user can read and write the settings
 */
Abrantes.settings = {

};

/**
 * Array of functions with the changes of each variant. The variants are also defined in an object that extends Abrantes.
 */
Abrantes.variants = [

];

/**
 * Selects a random variation from the list of available variants
 * @returns number
 */
Abrantes.randomVar = function () {
    const numberVariants = this.variants.length;
    this.variant = Math.floor(Math.random() * (numberVariants));
    return this.variant;
};

/**
 * Tracks the user using whatever is defined in an Abrantes plugin
 */
Abrantes.track = function () {
    throw ("Missing plugin to track results");
};

