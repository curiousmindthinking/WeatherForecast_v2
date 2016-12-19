process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');

var should = chai.should();
chai.use(chaiHttp);

describe('/POST measuremnts', function() {
    it('should add a new measuremnt on /measurement POST', function(done) {
        var req = {
            "timestamp": "2015-09-01T16:00:00.000Z",
            "temperature": 27.1,
            "dewPoint": 16.7,
            "precipitation": 0
        }

        chai.request(server)
            .post('/api/measurements')
            .send(req)
            .end(function(err, res) {
                res.should.have.status(201);

                done();
            });
    });
    it('should not be able to add a new measurement if timestamp is missing in request on /api/measurements POST', function(done) {
        var req = {
            "temperature": 27.1,
            "dewPoint": 16.7,
            "precipitation": 0
        }

        chai.request(server)
            .post('/api/measurements')
            .send(req)
            .end(function(err, res) {
                res.should.have.status(400);

                done();
            });
    });
});

describe('/GET:/timestamp measurements', function() {
    it('should list the found measurement by timestamp /api/measurements/timestamp GET', function(done) {
        chai.request(server)
            .get('/api/measurements/2015-09-01T16:00:00.000Z')
            .end(function(err, res) {
                var result = JSON.stringify(res.body);
                var jsonParse = JSON.parse(result);
                res.should.have.status(200);
                res.should.be.json;
                jsonParse.timestamp.should.equal('2015-09-01T16:00:00.000Z');

                done();
            });
    });

    it('should throw an error when search by timestamp is not /api/measurements/timestamp GET', function(done) {
        chai.request(server)
            .get('/api/measurements/2015-09-02T16:00:00.000Z')
            .end(function(err, res) {

                res.should.have.status(404);

                done();
            });
    });
});
describe('/PUT measuremnts', function() {
    it('should Update the existing measurement given by the timestamp', function(done) {
        var req = {
            "timestamp": "2015-09-01T16:00:00.000Z",
            "temperature": 27.1,
            "dewPoint": 16.7,
            "precipitation": 15.2
        }
        var timestampToFind = "2015-09-01T16:00:00.000Z"
        chai.request(server)
            .put('/api/measurements/' + timestampToFind)
            .send(req)
            .end(function(err, res) {
                res.should.have.status(204);
                done();
            });
    });
    it('should not Update the measurement for a given mismatch timestamp', function(done) {
        var req = {
            "timestamp": "2015-09-01T16:00:00.000Z",
            "temperature": 27.1,
            "dewPoint": 16.7,
            "precipitation": 15.2
        }
        var timestampToFind = "2015-09-02T16:00:00.000Z"
        chai.request(server)
            .put('/api/measurements/' + timestampToFind)
            .send(req)
            .end(function(err, res) {
                res.should.have.status(409);
                res.body.should.have.property('mismatch');
                done();
            });
    });
    it('should not Update the measurement for a given timestamp in the body which is not there in the measurement array', function(done) {
        var req = {
            "timestamp": "2015-09-02T16:00:00.000Z",
            "temperature": 27.1,
            "dewPoint": 16.7,
            "precipitation": 15.2
        }
        var timestampToFind = "2015-09-02T16:00:00.000Z"
        chai.request(server)
            .put('/api/measurements/' + timestampToFind)
            .send(req)
            .end(function(err, res) {
                res.should.have.status(404);
                res.body.should.have.property('notfound');
                done();
            });
    });
});

describe('/PATCH measuremnts', function() {
    it('should Partial Update the existing measurement given by the timestamp', function(done) {
        var req = {
            "timestamp": "2015-09-01T16:00:00.000Z",
            "precipitation": 15.5
        }
        var timestampToFind = "2015-09-01T16:00:00.000Z"
        chai.request(server)
            .patch('/api/measurements/' + timestampToFind)
            .send(req)
            .end(function(err, res) {
                res.should.have.status(204);
                done();
            });
    });
    it('should not do Partial Update the measurement for a given mismatch timestamp', function(done) {
        var req = {
            "timestamp": "2015-09-01T16:00:00.000Z",
            "precipitation": 15.2
        }
        var timestampToFind = "2015-09-02T16:00:00.000Z"
        chai.request(server)
            .patch('/api/measurements/' + timestampToFind)
            .send(req)
            .end(function(err, res) {
                res.should.have.status(409);
                done();
            });
    });
    it('should not do Partial Update the measurement for a given timestamp in the body which is not there in the measurement array', function(done) {
        var req = {
            "timestamp": "2015-09-02T16:00:00.000Z",
            "precipitation": 15.2
        }
        var timestampToFind = "2015-09-02T16:00:00.000Z"
        chai.request(server)
            .patch('/api/measurements/' + timestampToFind)
            .send(req)
            .end(function(err, res) {
                res.should.have.status(404);

                done();
            });
    });
});
describe('/DELETE measuremnts', function() {

    it('should Delete the existing measurement given by the timestamp', function(done) {

        var timestampToFind = "2015-09-01T16:00:00.000Z"
        chai.request(server)
            .delete('/api/measurements/' + timestampToFind)
            .end(function(err, res) {
                res.should.have.status(204);
                done();
            });
    });
});