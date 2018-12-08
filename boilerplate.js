const INPUT = 0;
const OUTPUT = 1;

const LOW = 0;
const HIGH = 1;

step = parseInt(step);
var cur_step = 0;

class Sensor {

    constructor(name) {

        this.value = 0;
        this.name = name;

        components.push({name: name, type: 'sensor'});
    }
}

class Button {
    constructor(name) {

        this.value = 0;
        this.name = name;

        components.push({name: name, type: 'button'});
    }
}

class LED {
    constructor(name) {

        this.value = 0;
        this.name = name;

        components.push({name: name, type: 'led'});
    }

    inputFrom(component, pin) {
        connection.push(
            {
                source: { 
                    name: component.name, 
                    pin: pin 
                }, 
                dest: {
                    name: this.name
                }
            });
    }
}

class ArduinoUno {
    constructor(name) {

        this.value = 0;
        this.name = name;
        this.pins = [];

        components.push({name: name, type: 'arduino_uno'});
    }
}

var curBoard;

function setBoard(board) {
    curBoard = board;
}

function pinMode(pin, type) {
    curBoard.pins[pin] = { type: type, value: 0 };
}

function digitalRead(pin) {
    return(curBoard.pins[pin].value);
}

function digitalWrite(pin, value) {
    curBoard.pins[pin].value = value;
    output.push({step: cur_step, pin: pin, value: curBoard.pins[pin].value});
    //pushOutput();
}

function pushOutput() {
    output.push(curBoard.pins);
}

function delay(value) {
    cur_step += value + 1;
}

connect();
setup();
for(cur_step = step; cur_step<step + 50; cur_step++) {
    loop();
    //pushOutput();
}

step = cur_step;