/**
  Setting up the validation rules.
*/
module.exports = function() {

    var dateTimeregex = /(\d{4})(-)?(\d{2})(-)?(\d{2})(T)?(\d{2})(:)?(\d{2})(:)?(\d{2})(\.\d+)?(Z|([+-])(\d{2})(:)?(\d{2}))/;
    var dateRegex = /(\d{4})(-)?(\d{2})(-)?(\d{2})/;

    function isFloat(n) {
        return n != "" && !isNaN(n) && Math.round(n) != n;
    };

    function isValidTimestamp(timestamp) {
        return !(typeof timestamp === "undefined" || timestamp === null);
    };
    return {
        isFloat: isFloat,
        isValidTimestamp: isValidTimestamp,
        dateRegex: dateRegex,
        dateTimeregex: dateTimeregex
    }
}();