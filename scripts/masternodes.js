var mongoose = require('mongoose')
    , lib = require('../lib/explorer')
    //, db = require('../lib/database')
    , settings = require('../lib/settings')
    //, Masternodes = require('../models/masternodes')
    , request = require('request');

mongoose.set('debug', false);

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;


var MasternodesSchema = new mongoose.Schema({
    hash: {type: String, default: ""},
    status: {type: String, default: ""},
    address: {type: String, default: ""},
    pubkey: {type: String, default: ""},
    lastseen: {type: String, default: ""},
    activesec: {type: Number, default: 0}
});

const conn = mongoose.createConnection(dbString);
const MyModel = conn.model('Masternodes', MasternodesSchema);

function exit() {
    mongoose.disconnect();
    process.exit(0);
}

function Action() {
    var req = request({
        uri: 'http://127.0.0.1:' + settings.port + '/api/listmasternodes',
        json: true
    }, function (error, response, body) {
    
console.log(body)
    var mn_hash = Object.keys(body);
	MyModel.remove({}, function(err) { 
	   console.log('collection removed')
	});
	
	
	
        lib.syncLoop(mn_hash.length, function (loop) {
            var mn = mn_hash[loop.iteration()];
            
			/*
			var mn_data = body[mn].split(/\s+/);
            var mn_status = mn_data[1];
            var mn_pubkey = mn_data[3];
            var mn_address = mn_data[4];
            var mn_lastseen = mn_data[5];
            var mn_activesec = mn_data[6];
			*/
			
			mn_status=body[mn].status;
			mn_pubkey=body[mn].addr;
			mn_address ='';
			mn_lastseen=body[mn].lastseen;
			mn_activesec=body[mn].activetime;
			
            var newmn = MyModel.findOneAndUpdate({hash: mn},{

                status: mn_status,
                address: mn_address,
                pubkey: mn_pubkey,
                lastseen: mn_lastseen,
                activesec: mn_activesec

            }, {returnNewDocument: true, upsert: true}, function () {
                loop.next();
            });

        }, function () {
            exit();
        });
    });
}

Action();
