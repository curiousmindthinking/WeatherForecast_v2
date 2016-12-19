 module.exports = function() {

     var promise = require('promise');
     var q = require('q');
     var _ = require('underscore');
     var lodash = require('lodash');
     var measurement = [];
     var validation = require('./validation');
     var common = require('./common');

     var errorCodes = {
         Invalid: 'invalid',
         Mismatch: 'mismatch',
         NotFound: 'notfound',
         Duplicate: 'duplicate'
     };

     /**
      * saveMeasurement: Save the new measurement that is sent in the request body to the measurement array.
      * @param {Json} The request body is sent.
      * @returns {Json}  The measurement array with the new inserted values or error message if any error.
      */
     function saveMeasurement(request) {
         var parsedRequest = JSON.parse(request);
         console.log('request');
         if (validation.isFloat(parsedRequest.temperature) && validation.isValidTimestamp(parsedRequest.timestamp)) {
             if (!common.checkIfDuplicateExists(measurement, parsedRequest.timestamp)) {
                 measurement.push({
                     timestamp: parsedRequest.timestamp,
                     temperature: parsedRequest.temperature,
                     dewPoint: parsedRequest.dewPoint,
                     precipitation: parsedRequest.precipitation
                 });
                 return q.when(JSON.stringify(measurement));
             } else {
                 return q.reject(errorCodes.Duplicate);
             }
         } else {
             return q.reject(errorCodes.Invalid);
         }
         console.log('after req' + JSON.stringify(measurement));
     };

     /**
      * findAndSendResponse: Find the measurements based on date or date-time in timestamp
      * @param {timestampToFind : DateTime} The timestamp  sent in the request.
      * @returns {Json} The corresponding measurement to the timestamp or error message if not found/invalid.
      */

     function findAndSendResponse(timestampToFind) {
         var foundMetric = common.findMeasurementForTimestamp(measurement, timestampToFind);
         if (_.isEmpty(foundMetric) || _.isUndefined(foundMetric)) {
             return q.reject(errorCodes.NotFound);
         } else {
             console.log('metric' + foundMetric);
             return q.when(foundMetric);
         }
     };

     /**
      * findandUpdateMeasurement: Update the measurement value with the values sent in the request body .
      * @param {timeStampToFind : DateTime} The timestamp sent in the request.
      *@param {measurementtoUpdate: JSON} The measurement array object which has new values and should replace the old values.
      * @returns {Json} The corresponding measurement to the timestamp or error message if not found/invalid.
      */
     function findandUpdateMeasurement(timestampToFind, measurementtoUpdate) {
         var metricFound = [];
         var measurementtoUpdate = JSON.parse(measurementtoUpdate);
         var originalMeasurementArrayKeysLength = _.allKeys(measurement[0]).length;
         var measurementtoUpdateKeysLength = _.allKeys(measurementtoUpdate).length;

         if (originalMeasurementArrayKeysLength === measurementtoUpdateKeysLength &&
             timestampToFind === measurementtoUpdate.timestamp) {
             if (validation.dateTimeregex.test(timestampToFind) && validation.isFloat(measurementtoUpdate.temperature)) {
                 var metricFoundIndex = lodash.findIndex(measurement, {
                     'timestamp': timestampToFind
                 });
                 metricFound = _.findWhere(measurement, {
                     timestamp: timestampToFind
                 });
                 console.log('metric for updating' + metricFound);
                 if (metricFoundIndex != -1 && metricFound.timestamp === measurementtoUpdate.timestamp) {
                     metricFound.timestamp = measurementtoUpdate.timestamp;
                     metricFound.temperature = measurementtoUpdate.temperature;
                     metricFound.dewpoint = measurementtoUpdate.dewpoint;
                     metricFound.precipitation = measurementtoUpdate.precipitation;
                     measurement[metricFoundIndex] = metricFound;
                     return q.when(JSON.stringify(metricFound));
                 } else {
                     return q.reject(errorCodes.NotFound);
                 }
             } else {
                 return q.reject(errorCodes.Invalid);
             }
         } else {
             return q.reject(errorCodes.Mismatch);
         }
     };
     /**
      * findandPatchMeasurement: Perform partial updated to the measurement values.
      * @param {timeStampToFind: DateTime} The timestamp  in the request.
      *@param {measurementtoPatch: JSON} The partial measurement array object with only some objects whose values need to be updated.
      * @returns {Json} The corresponding measurement to the timestamp or error message if not found/invalid.
      */
     function findandPatchMeasurement(timestampToFind, measurementtoPatch) {

         var measurementToPatch = JSON.parse(measurementtoPatch);
         var measurementToPatchKeys = _.allKeys(measurementToPatch);
         var measurementToPatchValue = measurementToPatch["timestamp"];
         if (timestampToFind !== measurementToPatchValue) {
             return q.reject(errorCodes.Mismatch);
         } else {
             var patchedMetric = _.findWhere(measurement, {
                 timestamp: timestampToFind
             });
             console.log('metric updated' + patchedMetric);
             if (JSON.stringify(patchedMetric) !== null && patchedMetric != undefined) {
                 console.log('metric updated' + 'true');
                 Object.keys(measurementToPatch).forEach(function(key) {
                     var value = measurementToPatch[key];
                     patchedMetric[key] = value;
                 });
                 return q.when(JSON.stringify(patchedMetric));
             } else {
                 return q.reject(errorCodes.NotFound);
             }
         }
     };

     /**
      * deleteMeasurement: Delete the measurement from the measurement array.
      * @param {timeStampToFind: DateTime} The timestamp  in the request.
      * @returns {Json} The remaining measurement array  error message if not found/invalid.
      */
     function deleteMeasurement(timestampToFind) {
         var timestampToFind = JSON.stringify(timestampToFind);
         var measurementinjson = JSON.stringify(measurement);
         console.log('timestampToFind' + timestampToFind);
         if (validation.dateTimeregex.test(timestampToFind)) {
             var remainingMetric = measurement.splice(_.indexOf(measurement,
                 _.findWhere(measurement, {
                     timestamp: timestampToFind
                 })), 1);

             if (JSON.stringify(remainingMetric) !== null && !_.isEmpty(remainingMetric)) {
                 return q.when(JSON.stringify(remainingMetric));
             } else {
                 return q.reject(errorCodes.NotFound);
             }
         } else {
             return q.reject(errorCodes.Invalid);
         }

     };

     return {
         measurement: measurement,
         saveMeasurement: saveMeasurement,
         findAndSendResponse: findAndSendResponse,
         findandUpdateMeasurement: findandUpdateMeasurement,
         findandPatchMeasurement: findandPatchMeasurement,
         deleteMeasurement: deleteMeasurement
     };
 }();