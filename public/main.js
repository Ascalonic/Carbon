render_data = {};
var step = 0;
var sim_i = 0;
var sim_data = [];
var sim = null;
var output_devices = [];


function renderBoard(component, svg, pincount) {

    var svgNS = svg.namespaceURI;
    var board = document.createElementNS(svgNS, 'rect');
    board.setAttribute('x', 30);
    board.setAttribute('y', 100);
    board.setAttribute('width', pincount * 11);
    board.setAttribute('height', 100);
    board.setAttribute('fill', '#AAAAAA');
    
    svg.appendChild(board);

    render_data[component.name] = {pin_locations: []};

    for(var i = 0;i<pincount/2;i++) {

        var pin = document.createElementNS(svgNS, 'rect');
        pin.setAttribute('x', 50 + i * 20);
        pin.setAttribute('y', 115);
        pin.setAttribute('width', 5);
        pin.setAttribute('height', 5);
        pin.setAttribute('fill', '#444444');

        svg.appendChild(pin);

        render_data[component.name].pin_locations.push({x: 50 + i * 20, y: 115});
    }

    for(var i = 0;i<pincount/2;i++) {

        var pin = document.createElementNS(svgNS, 'rect');
        pin.setAttribute('x', 50 + i * 20);
        pin.setAttribute('y', 180);
        pin.setAttribute('width', 5);
        pin.setAttribute('height', 5);
        pin.setAttribute('fill', '#444444');

        svg.appendChild(pin);

        render_data[component.name].pin_locations.push({x: 50 + i * 20, y: 180});
    }
}

function renderLEDToBoard(board, pin, svg, led_name) {

    const pincount = 24;

    var start_x = render_data[board].pin_locations[pin - 1].x + 2;
    var start_y = render_data[board].pin_locations[pin - 1].y;

    var end_x = start_x;
    var end_y = pin <= pincount/2 ? start_y - 30 : start_y + 30;

    var svgNS = svg.namespaceURI;
    var conn_wire = document.createElementNS(svgNS, 'line');

    conn_wire.setAttribute('x1', start_x);
    conn_wire.setAttribute('y1', start_y);
    conn_wire.setAttribute('x2', end_x);
    conn_wire.setAttribute('y2', end_y);
    conn_wire.setAttribute('style', 'stroke:rgb(0, 0, 0);stroke-width:2');

    svg.appendChild(conn_wire);

    var led_top = document.createElementNS(svgNS, 'circle');

    led_top.setAttribute('cx', end_x);
    led_top.setAttribute('cy', pin <= pincount/2 ? end_y - 10 : end_y + 10);
    led_top.setAttribute('r', 7);
    led_top.setAttribute('stroke', 'rgb(0, 0, 0)');
    led_top.setAttribute('fill', '#AAAAAA');
    led_top.setAttribute('class', 'led-off');
    led_top.setAttribute('id', led_name + '-top');

    svg.appendChild(led_top);

    var led_bottom = document.createElementNS(svgNS, 'rect');

    led_bottom.setAttribute('x', end_x - 7);
    led_bottom.setAttribute('y', pin <= pincount/2 ? end_y - 10 : end_y);
    led_bottom.setAttribute('width', 14);
    led_bottom.setAttribute('height', 10);
    led_bottom.setAttribute('stroke', 'rgb(0, 0, 0)');
    led_bottom.setAttribute('fill', '#AAAAAA');
    led_bottom.setAttribute('class', 'led-off');
    led_bottom.setAttribute('id', led_name + '-bottom');

    svg.appendChild(led_bottom);

    render_data[led_name] = {id: [led_name + '-top', led_name + '-bottom']};
}

function renderComponents(components, connections) {

    var svg = document.getElementById('simspace');
    $('#simspace').empty();

    svg.setAttribute('width', 512);
    svg.setAttribute('height', 512);

    var main_board = '';

    for(var i = 0;i<components.length;i++) {
        if(components[i].type == 'arduino_uno') {
            renderBoard(components[i], svg, 24);
            main_board = components[i].name;
        }
    }

    for(var i = 0;i<connections.length;i++) {
        //draw the devices connected to main board
        if(connections[i].source.name == main_board) {
            for(var j = 0;j<components.length;j++) {
                if(components[j].name == connections[i].dest.name && components[i].type == 'led') {
                    renderLEDToBoard(main_board, connections[i].source.pin, 
                        svg, connections[i].dest.name);
                    output_devices.push(
                        {
                            component: components[j], 
                            source: {
                                component: main_board, 
                                pin: connections[i].source.pin
                            }
                        });
                }
            }
        }
    }

    document.body.appendChild(svg);
}

function stopTimer() {
    clearInterval(sim);
}

$(document).ready(function(){
    $('#btnsim').click(build);
})

function build() {

    render_data = {};
    step = 0;
    sim_i = 0;
    sim_data = [];
    sim = null;
    output_devices = [];
    
    $.post("sss/design",
    {
        source: editor.getValue(),
    },
    function(data, status) {
        //build design
        renderComponents(data.components, data.connections);
        simulate();
    })
}

function simulate() {
    $.post("sss/sim",
    {
        source: editor.getValue(),
        step: step
    },
    function(data, status) {
        //build design
        sim_data = data;
        sim_i = 0;

        console.log(sim_data);

        sim = setInterval(function(){

            if(sim_data[sim_i].step == step) {

                if(sim_data[sim_i].pin == 5) {
                    if(sim_data[sim_i].value == 0) {
                        document.getElementById('led-top').setAttribute('class', 'led-off');
                        document.getElementById('led-bottom').setAttribute('class', 'led-off');
                    }
                    else {
                        document.getElementById('led-top').setAttribute('class', 'led-on');
                        document.getElementById('led-bottom').setAttribute('class', 'led-on');
                    }
                }
                sim_i ++;
            }

            step++;

            if(sim_i >= sim_data.length) {
                stopTimer();
                step = sim_data[sim_data.length - 1].step;

                simulate();
            }
                
        }, 100)
    })   
}