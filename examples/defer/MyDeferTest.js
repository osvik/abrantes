// Create the test
var MyDeferTest = Object.create(Abrantes);

// Define the variants
MyDeferTest.variants = [

    // Original
    function () {
        $("#bigH1").text("MyDeferTest Original");
    },

    // Variant 1
    function () {
        $("#bigH1").text("MyDeferTest Variant 1");
    },

    // Variant 2
    function () {
        $("#bigH1").text("MyDeferTest Variant 2");
    },

];

// Assign a variant
MyDeferTest.assignVariant("MyDeferTest");

// Render the variant
MyDeferTest.renderVariant();

// Persist the variant in the browser
MyDeferTest.persist("cookie");

// Track the variant in a dimension 
MyDeferTest.track("test_event");