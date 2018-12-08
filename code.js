function connect() {

    led = new LED('led');
    board = new ArduinoUno('mainboard');

    setBoard(board);
    led.inputFrom(board, 5);
}

////////////////////////////////////////

x = 0; y = 0;

function setup() {
    pinMode(5, OUTPUT);
}

function loop() {
    digitalWrite(5, HIGH);
    delay(2);
    digitalWrite(5, LOW);
    delay(2);
}