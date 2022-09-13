'use strict';

function validateIDInput(input) {
    if(typeof(input) !== 'string') {
        return null;
    }
    // Basic ASCII alphanumeric santization, from AD7six on Stack Overflow
    // Source: https://stackoverflow.com/questions/9364400/remove-not-alphanumeric-characters-from-string
    let santizedIDValue = (input).replace(/[^0-9a-z]/gi, '');

    // Validate the input so the length is between 1 and 15 characters
    if((santizedIDValue).length < 1) {
        return null;
    }
    if((santizedIDValue).length > 25) { // max length is arbitrary for now
        return null;
    }
    return santizedIDValue;
}