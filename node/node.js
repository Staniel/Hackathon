var databaseUrl = "db"; // "username:password@example.com/mydb"
var collections = ["users", "submits"];
var db = require("mongojs").connect(databaseUrl, collections);

var restify = require('restify');

function operations(req, res, next, user) {
    //res.send(201, [req.params, user]);
    if(user[req.params["op"]] == 1) {
        if(req.params["op"] == "find") {
            myfindparams = {};
            myfindparams["author"] = user["name"];
            if(req.params["submitted_after"]) {
                if(!myfindparams["submitted_on"]) myfindparams["submitted_on"] = {};
                myfindparams["submitted_on"]["$gt"] = req.params["submitted_after"];
            }

            if(req.params["submitted_before"]) {
                if(!myfindparams["submitted_on"]) myfindparams["submitted_on"] = {};
                myfindparams["submitted_on"]["$lt"] = req.params["submitted_before"];
            }

            db.submits.find(myfindparams, function(err, results) {
                if(err || !results) {
                    res.send(500, codeGenerator("databaseFindFail", "something wrong"));
                    return next();
                } else {
                    console.log(myfindparams);
                    console.log(results);
                    res.send(201, results);
                    return next();
                }
            });
        }
        if(req.params["op"] == "write") {
            towrite = {"author": user["name"], "submitted_on": (new Date()).toISOString()};
            thiscontent = JSON.parse(req.params["content"]);
            towrite["content"] = thiscontent;
            
            db.submits.save(towrite, function(err, saved) {
                if(err || !saved) {
                    res.send(500, codeGenerator("databaseWriteFail", "something wrong"));
                    return next();
                } else {
                    console.log(saved);
                    res.send(201, {"ok": 1});
                    return next();
                }
            });
        }

    } else {
        res.send(403, codeGenerator("permissionDenied", "Permission Denied"));
        return next();
    }
}

function authenticate(req, res, next) {
    console.log("trying to authenticate");
    db.users.find({"key": req.params.key}, function(err, users) {
        console.log("db returned");
        console.log(users);
        if( err || !users || users.length == 0) {
            console.log("auth failed");
            res.send(403, codeGenerator("authenticationFailed", "Wrong Key"));
            return next();
        }
        else operations(req, res, next, users[0]);
    });
}

function codeGenerator(code, msg) {
    return {"code": code, "message": msg};
}

var server = restify.createServer();
server.use(restify.bodyParser({
    mapParams: true,
    overrideParams: true
}));

server.listen(8080);

function send(req, res, next) {
    res.send('hello ' + req.params.name);
    return next();
}

server.post('/data/:op', function create(req, res, next) {
    /*if(req.params.key == authkey) {
        res.send(201, req.params);
    } else {
        res.send(403, codeGenerator("authenticationFailed", "Wrong Key"));
    }*/
    authenticate(req, res, next);
});

server.put('/data', send);
server.get('/data/:name', send);
server.head('/data/:name', send);

server.del('data/:name', function rm(req, res, next) {
    res.send(204);
    return next();
});
