const vm = require('vm')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const esprima = require('esprima')
const esrefactor = require('esrefactor')
const server = express()
const port = 8080

const boilerplate = fs.readFileSync('boilerplate.js')
var memory = {};
var code = "";

server.use(express.static('public'))
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended: false}))

server.get('/', (req, res) => {
    res.sendFile('index.html');
});

server.post('/sss/design', (req, res) => {

    memory = {};
    code = "";

    var data = req.body.source;

    bp_ids = ['delay', 'LOW', 'HIGH', 'digitalWrite', 'digitalRead', 'OUTPUT', 'INPUT', 
                'pinMode', 'setBoard', 'ArduinoUno', 'LED', 'Sensor', 'Button', 'inputFrom'];

    code = data; i = 0;
    //refactor the identifiers
    while(i<code.length) {
        ctx = new esrefactor.Context(code);
        var id = ctx.identify(i);
        if(typeof id!="undefined") {

            if(id.identifier.name == 'memory') {
                i += id.identifier.name.length;
                continue;
            }

            var bp_id = false;
            //console.log(id.identifier.name);
            for(var j = 0;j<bp_ids.length;j++) {
                if(bp_ids[j] == id.identifier.name) {
                    bp_id = true;
                    break;
                }
            }
            if(!bp_id) {
                //console.log(id.identifier.name);
                code = ctx.rename(id, "memory['" + id.identifier.name + "']");
            }
        }
        i++;
    }

    code += boilerplate;
    data = code;

    console.log(data);
    
    const sandbox = {components : [], 
                    connection: [],
                    output: [],
                    step: 0,
                    memory: {}};

    vm.createContext(sandbox);
    vm.runInContext(data, sandbox);

    res.send({
        components: sandbox.components,
        connections: sandbox.connection
    });
})

server.post('/sss/sim', (req, res) => {

    data = code;

    const sandbox = {components : [], 
                    connection: [],
                    output: [],
                    step: parseInt(req.body.step) + 1,
                    memory: memory};

    vm.createContext(sandbox);
    vm.runInContext(data, sandbox);

    console.log(sandbox.output);
    memory = sandbox.memory;

    res.send(sandbox.output);
})

server.listen(port, () => console.log(`Carbon listening on port ${port}`))