process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
var measurementService = require('../services/measurement-service.js');
chai.use(chaiHttp);

describe('/GET:/stats for given measurements', function() {
    measurementService.measurement.push({
        timestamp: "2015-09-01T16:10:00.000Z",
        temperature: 27.3,
        dewPoint: 10,
        precipitation: 0
    });
    measurementService.measurement.push({
        timestamp: "2015-09-01T16:20:00.000Z",
        temperature: 27.5,
        dewPoint: 15,
        precipitation: 0
    });
    it('should find the min and max value for given metric "temperature"', function(done) {
        chai.request(server)
            .get('/api/stats?stats=min&stats=max&metric=temperature&fromDate=2015-09-01T16:00:00.000Z&toDate=2015-09-01T17:00:00.000Z')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;

                done();
            });
    });
    it('should find the min and max value for given metric "dewPoint"', function(done) {
        chai.request(server)
            .get('/api/stats?stats=min&stats=max&metric=dewPoint&fromDate=2015-09-01T16:00:00.000Z&toDate=2015-09-01T17:00:00.000Z')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;

                done();
            });
    });
});