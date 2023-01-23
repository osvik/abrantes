/* jshint esversion:6 */

Abrantes = Object.create(null);

Abrantes.testId = undefined;
Abrantes.variant = undefined;

/**
 * Assigns a variant to a user
 * @param {string} testId 
 */
Abrantes.assignVariant = function(testId){
    if ( typeof(testId) !== "string" || testId.length === 0 ) {
        throw("You need to provide an ID when assigning a variant");
    }
    this.testId = testId;
    if ( typeof(this.readPersistent()) === "number" ) {
        this.variant = this.readPersistent();
    } else {
        this.variant = Abrantes.randomVar();
    }
};

/**
 * Renders the variant
 * @param {Number} variant 
 */
Abrantes.renderVariant = function(variant=this.variant){
    if (typeof (this.variants[variant]) === "function" ) {
        this.variants[variant]();
    } else {
        throw("The variant " + variant + " does not exist");
    }
};

/**
 * Stores the test id (object name) and variant in localStorage
 */
Abrantes.persist = function(){
    localStorage.setItem( this.testId, this.variant);
};

/**
 * Reads the value in the storage
 * @returns 
 */
Abrantes.readPersistent = function() {
    let inStorage = localStorage.getItem( this.testId);
    if ( typeof(inStorage) === "string" || typeof(inStorage) === "number" ){
        return Number(inStorage);
    } else {
        return undefined;
    }
};

/**
 * Object where the user can read and write the settings
 */
Abrantes.settings = {
    storage: "localStorage",
    renderEvent : "DOMContentLoaded",
    storeEvent: "saveTestVariant",
    analyticsDelay: 2000,
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
Abrantes.randomVar = function(){
    const numberVariants = this.variants.length;
    this.variant = Math.round(Math.random() * (numberVariants - 1));
    return this.variant;
};
