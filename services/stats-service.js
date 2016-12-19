module.exports = function() {
    var promise = require('promise');
    var q = require('q');
    var _ = require('underscore');
    var lodash = require('lodash');
    var max = require('lodash.max');
    var min = require('lodash.min');
    var validation = require('./validation');
    var measurementService = require('./measurement-service.js');
    var stats = [];

    /**
     * findMinMaxAverage: Calcutes the min,max and average of a given metric for a given time period.
     * @param {metric:String} Metric can be any of the key in the measurement array.
     * @param {stat:String} Stat can be min, max or average.
     * @param {fromDate:DateTime} From date for the time period.
     * @param {toDate:DateTime} To date for the time period.d
     * @returns {JSON} Computed values based on the stats.
     */


    function findMinMaxAverage(metric, stat, fromDate, toDate) {
        console.log("metric" + stat);
        if (stat === 'min')
            return findMin(metric, fromDate, toDate);
        if (stat === 'max')
            return findMax(metric, fromDate, toDate);
        if (stat === 'average')
            return findAverage(metric, fromDate, toDate);
    };
    /**
     * findValuesByMetric: Given a type of metric, find all the values for a given time period
     * @param {metric:String} Metric can be any of the key in the measurement array.
     * @param {fromDate:DateTime} From date for the time period.
     * @param {toDate:DateTime} To date for the time period.d
     * @returns  {Number|Array} Values based on the metric
     */

    function findValuesByMetric(metric, fromDate, toDate) {
        var startDate = fromDate;
        var endDate = toDate;
        if (fromDate !== undefined && toDate !== undefined) {
            var requiredData = lodash.filter(measurementService.measurement, function(data) {
                return data.timestamp >= startDate && data.timestamp <= endDate;
            });
            console.log("reqd" + requiredData);
            var valueArray = _.pluck(requiredData, metric);
            return valueArray;
        } else {
            var requiredData = JSON.stringify(measurementService.measurement);
            var valueArray = _.pluck(measurementService.measurement, metric);
            console.log('valueArray' + JSON.stringify(valueArray).replace(/]|[[]/g, ''));
            return valueArray;
        }

    };

    /**
     * findMin: Given a type of metric, find the minimum value for a given time period
     * @param {metric:String} Metric can be any of the key in the measurement array.
     * @param {fromDate:DateTime} From date for the time period.
     * @param {toDate:DateTime} To date for the time period.d
     * @returns  {Number} Minimum value of a given metric
     */
    function findMin(metric, fromDate, toDate) {
        var jsonData = {};
        console.log('entering min');
        var minvalueArray = findValuesByMetric(metric, fromDate, toDate);
        console.log("minvalueArray" + minvalueArray);
        if (!_.isUndefined(minvalueArray) && !_.isNull(minvalueArray)) {

            var minVal = min(minvalueArray);
            console.log('minval' + minVal);
            jsonData[metric] = minVal;
            jsonData['stat'] = 'min';
            return jsonData;
        } else {
            return null;
        }
    };
    /**
     * findMax: Given a type of metric, find the maximum value for a given time period
     * @param {metric:String} Metric can be any of the key in the measurement array.
     * @param {fromDate:DateTime} From date for the time period.
     * @param {toDate:DateTime} To date for the time period.d
     * @returns  {Number} Maximum value of a given metric
     */

    function findMax(metric, fromDate, toDate) {
        var jsonData = {};
        console.log('metric' + metric);
        var maxvalueArray = findValuesByMetric(metric, fromDate, toDate);
        var maxVal = max(maxvalueArray);
        console.log('valueArray' + maxvalueArray);
        console.log('maxval' + maxVal);
        jsonData[metric] = maxVal;
        jsonData['stat'] = 'max';
        return jsonData;
    };

    /**
     * findAverage: Given a type of metric, find the average value for a given time period
     * @param {metric:String} Metric can be any of the key in the measurement array.
     * @param {fromDate:DateTime} From date for the time period.
     * @param {toDate:DateTime} To date for the time period.d
     * @returns  {Number} Average value of a given metric
     */
    function findAverage(metric, fromDate, toDate) {
        var jsonData = {};
        var averageValueArray = findValuesByMetric(metric, fromDate, toDate);
        var sum = 0;
        var totalSumArray = _.map(averageValueArray, function(num) {
            sum += num;
            return sum;
        });
        var totalSum = totalSumArray.slice(-1)[0];
        var average = totalSum / averageValueArray.length;
        console.log('avg' + JSON.stringify(average));
        jsonData[metric] = average;
        jsonData['stat'] = 'average';
        return jsonData;
    };

    /**
     * findAndSendResponse: Find the computed values based on a given set of metric params, stat params , from date and to date.
     * @param {queryParams:JSON} Query parameters passed in the Get request(metric, stats, fromDate,toDate).
     * @returns {JSON} Computed values based on the stats.
     */
    function findAndSendResponse(queryParams) {
        var valToSend = [];
        console.log(queryParams);
        var metrics = queryParams.metric;
        var stats = queryParams.stats;
        console.log("metrics" + metrics);
        console.log("stats" + stats);
        if (_.isArray(metrics)) {
            _.each(metrics, function(metric) {
                _.each(stats, function(stat) {
                    var receivedVal = findMinMaxAverage(metric, stat, queryParams.fromDate, queryParams.toDate);
                    if (!_.isNull(receivedVal) || _.isUndefined(receivedVal))
                        valToSend.push(receivedVal);
                    else {
                        valToSend = [];
                    }
                });
            });
        } else {
            _.each(stats, function(stat) {
                console.log("fromDate" + queryParams.fromDate);
                var receivedVal = findMinMaxAverage(metrics, stat, queryParams.fromDate, queryParams.toDate);
                if (!_.isNull(receivedVal) && !_.isUndefined(receivedVal))
                    valToSend.push(receivedVal);
                else {
                    valToSend = [];
                }
            });
        }
        console.log(valToSend);
        return q.when(valToSend);
    };


    return {
        findAndSendResponse: findAndSendResponse
    }

}();