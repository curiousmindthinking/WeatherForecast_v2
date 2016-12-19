module.exports = function() {

    var _ = require('underscore');
    var lodash = require('lodash');
    var validation = require('./validation');
    /**
     * checkIfDuplicateExists: If there is an already existing timestamp then it should not insert.
     * @param {string} measurementArray The measurementArray contains all the measurements that have been recorded.
     * @param {timeStampToInsert} The new timestamp that needs to be inserted.
     * @returns {boolean}
     */
    function checkIfDuplicateExists(measurementArray, timeStampToInsert) {
        console.log('measurementarray', measurementArray);
        if (_.isEmpty(measurementArray)) {
            return false;
        } else {
            var isDuplicate = measurementArray.reduce(function(previous, current) {
                console.log('current' + current.timestamp);
                return (timeStampToInsert === current.timestamp) || previous;
            }, false);
            if (!isDuplicate) return false;
            else {
                return true;
            }
        }
    };
    /**
     * findMeasurement: If there is an already existing measurement then it should be sent.
     * @param {timeStampToInsert} The timestamp that was sent in the request.
     * @returns {Json} The corresponding measurement to the timestamp.
     */
    function findMeasurementForTimestamp(measurementArray, timestampToFind) {
        var metric = [];
        console.log('request' + timestampToFind);
        if (validation.dateTimeregex.test(timestampToFind)) {
            metric = lodash.find(measurementArray, {
                'timestamp': timestampToFind
            });
            console.log('metric found' + JSON.stringify(metric));
        } else {
            metric = findMeasurementForDate(measurementArray, timestampToFind);
        }
        return metric;
    };

    function findMeasurementForDate(measurementArray, timestampToFind) {
        var metric = [];
        var time = new Date(timestampToFind);
        console.log('request' + timestampToFind);

        metric = lodash.filter(measurementArray, function(v) {
            console.log(v.timestamp);
            return (time.getUTCFullYear() === new Date(v.timestamp).getUTCFullYear() &&
                time.getUTCMonth() === new Date(v.timestamp).getUTCMonth() &&
                time.getUTCDate() === new Date(v.timestamp).getUTCDate());
        });

        return metric;
    };

    return {
        checkIfDuplicateExists: checkIfDuplicateExists,
        findMeasurementForTimestamp: findMeasurementForTimestamp
    };
}();