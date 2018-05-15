var express = require('express');
var router = express.Router();
var lamps = require('../bin/LampServer')

/* GET home page. */
router.get('/list', function (req, res, next) {
    let list = []
    lamps.forEach(
        lamp => list.push(lamp.print())
    )
    res.json(list)
});

router.route('/status/:id')
    .all(function(req, res, next) {
        let lamp = lamps.get(req.params.id)
        if(lamp)
            next(lamp)
        else
            next()
    })
    .get((lamp, req, res, next) => {
        res.json(lamp.print())
    })
    .post((lamp, req, res, next) => {
        if (req.body.cmd)
            lamp.cmd(
                req.body.cmd,
                req.body.arg,
                msg => {
                    res.send(msg)
                }
            )
    })

module.exports = router;
