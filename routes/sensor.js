var express = require('express');
var router = express.Router();
var sensors = require('../bin/SensorServer')

/* GET home page. */
router.get('/list', function (req, res, next) {
    let list = []
    sensors.forEach(
        lamp => list.push(lamp.print())
    )
    res.json(list)
});

router.route('/status/:id')
    .all(function(req, res, next) {
        let sensor = sensors.get(req.params.id)
        if(sensor)
            next(sensor)
        else
            next()
    })
    .get((sensor, req, res, next) => {
        res.json(sensor.print())
    })
    .post((sensor, req, res, next) => {
        if (req.body.cmd)
            sensor.cmd(
                req.body.cmd,
                req.body.arg,
                msg => {
                    res.send(msg)
                }
            )
    })

module.exports = router;