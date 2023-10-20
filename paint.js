let color = '#000000';
let pallete = document.getElementById('color-picker');
let shapePallete = document.getElementById('shape-picker');

for (let btn of pallete.getElementsByTagName('button')) {
    btn.style.setProperty('background-color', btn.dataset.color);
}

pallete.addEventListener('click', function(event){
    let target = event.target;
    let btn = target.closest('button.color');
    if ( ( (btn === undefined) || (btn === null) || (btn.tagName != 'BUTTON') || (! pallete.contains(btn)) ) ) {
        return;
    }
    color = btn.dataset.color;
    pallete.querySelector('button.selected').classList.remove('selected');
    btn.classList.add('selected');
});


shapePallete.addEventListener('click', function(event){
    let target = event.target;
    let btn = target.closest('button.shape');
    if ( ( (btn === undefined) || (btn === null) || (btn.tagName != 'BUTTON') || (! shapePallete.contains(btn)) ) ) {
        return;
    }
    shapeType = btn.dataset.shape;
    shapePallete.querySelector('button.selected').classList.remove('selected');
    btn.classList.add('selected');
    document.getElementById('hint').innerText = btn.dataset.hint ?? '';
    if (btn.dataset.enableKeyboard) {
        document.getElementById('keyboard').classList.remove('hide');
    } else {
        document.getElementById('keyboard').classList.add('hide');
    }
});

let shapeType = 'line';
let canvas = document.getElementById('canvas');
let startCoords = {};

let currentShape;

let calcRadius = function(startCoordinates, endCoordinates) {
    let dx = (startCoordinates.x - endCoordinates.x),
        dy = (startCoordinates.y - endCoordinates.y);
    return Math.hypot(dx, dy);
};

let drawLine = function(event, startCoordinates, endCoordinates) {
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute('x1', startCoordinates.x);
    line.setAttribute('y1', startCoordinates.y);
    line.setAttribute('x2', endCoordinates.x);
    line.setAttribute('y2', endCoordinates.y);
    line.setAttribute('stroke', color);
    canvas.appendChild(line);
    return line;
};

let drawPencil = function(event, coordinates) {
    let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('cx', coordinates.x);
    circle.setAttribute('cy', coordinates.y);
    circle.setAttribute('r', 1);
    circle.setAttribute('stroke', color);
    circle.setAttribute('fill', color);
    canvas.appendChild(circle);
    return circle;
};

let drawCircle = function(event, startCoordinates, endCoordinates) {
    let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('cx', startCoordinates.x);
    circle.setAttribute('cy', startCoordinates.y);
    circle.setAttribute('r', calcRadius(startCoordinates, endCoordinates));
    circle.setAttribute('stroke', color);
    circle.setAttribute('fill', 'none');
    canvas.appendChild(circle);
    return circle;
};

let drawRectangle = function(event, startCoordinates, endCoordinates) {
    let shiftPressed = event.shiftKey || shiftButtonPressed;
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    let width = Math.abs(endCoordinates.x - startCoordinates.x),
        height = Math.abs(endCoordinates.y - startCoordinates.y);
    if (shiftPressed) { // square
        let edgeLength = Math.max(width, height);
        rect.setAttribute('x', endCoordinates.x > startCoordinates.x ? startCoordinates.x : startCoordinates.x - edgeLength);
        rect.setAttribute('y', endCoordinates.y > startCoordinates.y ? startCoordinates.y : startCoordinates.y - edgeLength);
        rect.setAttribute('width', edgeLength);
        rect.setAttribute('height', edgeLength);
    } else { // rectangle
        rect.setAttribute('x', Math.min(startCoordinates.x, endCoordinates.x));
        rect.setAttribute('y', Math.min(startCoordinates.y, endCoordinates.y));
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
    }
    rect.setAttribute('stroke', color);
    rect.setAttribute('fill', 'none');
    canvas.appendChild(rect);
    return rect;
};

let drawShape = function(event, startCoordinates, endCoordinates) {
    if (shapeType == 'line') {
        return drawLine(event, startCoordinates, endCoordinates);
    } else if (shapeType == 'circle') {
        return drawCircle(event, startCoordinates, endCoordinates);
    } else if (shapeType == 'rectangle') {
        return drawRectangle(event, startCoordinates, endCoordinates);
    } else if (shapeType == 'pencil') {
        return drawPencil(event, endCoordinates);
    } else {
        console.log(`Error: tool ${shapeType} not exists.`);
    }
}

canvas.addEventListener('pointerdown', function(event) {
    canvas.setPointerCapture(event.pointerId);
    startCoords.x = event.pageX;
    startCoords.y = event.pageY;
});

canvas.addEventListener('pointerup', function(event) {
    let endCoords = {
        x: event.pageX,
        y: event.pageY,
    };
    drawShape(event, startCoords, endCoords);
});

canvas.addEventListener('pointermove', function(event) {
    if (event.buttons == 0) return;

    let endCoords = {
        x: event.pageX,
        y: event.pageY,
    };
    
    if ((currentShape !== null) && (currentShape !== undefined) && (shapeType != 'pencil')) {
        canvas.removeChild(currentShape);
    }

    currentShape = drawShape(event, startCoords, endCoords);
});

let shiftButtonPressed = false;
let shiftButton = document.getElementById('shiftButton');
shiftButton.addEventListener('pointerdown', function(event) {
    shiftButton.setPointerCapture(event.pointerId);
    shiftButtonPressed = true;
    shiftButton.classList.add('pressed');
});

shiftButton.addEventListener('lostpointercapture', function(event) {
    shiftButtonPressed = false;
    shiftButton.classList.remove('pressed'); 
});
