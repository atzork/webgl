function resizeCanvas(canvas) {
    // получаем размер HTML-элемента canvas
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // проверяем, отличается ли размер canvas
    if (canvas.width !== displayWidth ||
        canvas.height !== displayHeight) {

        // подгоняем размер буфера отрисовки под размер HTML-элемента
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}

function randomInt(range) {
    return Math.floor(Math.random() * range)
}

function getSinCosByAngleDeg(degrees) {
    const radians = degrees * Math.PI / 180
    const sin = Math.sin(radians)
    const cos = Math.cos(radians)
    return [sin, cos]
}

const m3 = {
    translation: (tx, ty) => [
        1,  0,  0,
        0,  1,  0,
        tx, ty, 1
    ],

    rotation: (s, c) =>  [
            c, -s, 0,
            s,  c, 0,
            0,  0, 1
        ],

    scaling: (sx, sy) => [
        sx,  0, 0,
         0, sy, 0,
         0,  0, 1
    ],

    projection: (width, height) => [
         2 / width, 0,          0,
         0,        -2 / height, 0,
        -1,         1,          1
    ],

    translate: (m, tx, ty) => m3.multiply(m, m3.translation(tx, ty)),
    rotate: (m, s, c) => m3.multiply(m, m3.rotation(s, c)),
    scale: (m, sx, sy) => m3.multiply(m, m3.scaling(sx, sy)),

    identity: [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ],

    multiply: (a, b) => {
        const a00 = a[0 * 3 + 0];
        const a01 = a[0 * 3 + 1];
        const a02 = a[0 * 3 + 2];
        const a10 = a[1 * 3 + 0];
        const a11 = a[1 * 3 + 1];
        const a12 = a[1 * 3 + 2];
        const a20 = a[2 * 3 + 0];
        const a21 = a[2 * 3 + 1];
        const a22 = a[2 * 3 + 2];
        const b00 = b[0 * 3 + 0];
        const b01 = b[0 * 3 + 1];
        const b02 = b[0 * 3 + 2];
        const b10 = b[1 * 3 + 0];
        const b11 = b[1 * 3 + 1];
        const b12 = b[1 * 3 + 2];
        const b20 = b[2 * 3 + 0];
        const b21 = b[2 * 3 + 1];
        const b22 = b[2 * 3 + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },
}

export default class Main {
    gl;

    constructor() {
        const canvas = document.getElementById('canvas')
        this.gl = canvas.getContext('webgl');

        if(!this.gl) {
            console.log('WebGL does not supported!!')
            return;
        }
        resizeCanvas(this.gl.canvas)

        // window.addEventListener('resize', () => {
        //     requestAnimationFrame(() => {
        //         resizeCanvas(this.gl.canvas)
        //         this.drawRectangle(vertexShader, fragmentShader)
        //     })
        // })

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.loadShaderSources().then(([vertexShaderSource, fragmentShaderSource]) => {
            const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource)

            const program = this.createProgram(vertexShader, fragmentShader)
            const locations = {
                positionLocation: this.gl.getAttribLocation(program, 'a_position'),
                resolutionLocation: this.gl.getUniformLocation(program, 'u_resolution'),
                colorLocation: this.gl.getUniformLocation(program, 'u_color'),
                matrixLocation: this.gl.getUniformLocation(program, 'u_matrix')
            }
            const positionBuffer = this.gl.createBuffer();
            const rectangleSettings = {
                translation: [300, 300],
                rotation: getSinCosByAngleDeg(220),
                scale: [1, 1],
                x: 10, y: 20,
                width: 100,
                height: 30,
                color: [Math.random(),Math.random(),Math.random(),1]
            }

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
            this.setGeometry(rectangleSettings.x, rectangleSettings.y)
            this.drawScene(program, locations, rectangleSettings);
            this.animate(program, locations, rectangleSettings, 0)
        })
    }

    animate(program, locations, rectangleSettings, angel) {
        requestAnimationFrame(() => {
            const rotation = getSinCosByAngleDeg(angel)
            const scale = angel < 180 ? Math.max(angel / 20, 1) : Math.max((360 - angel) / 20, 1)
            this.drawScene(
                program, locations,
                {...rectangleSettings,
                    rotation: rotation,
                    color: [rotation[0], rotation[1],rotation[1],1],
                    // scale: [scale, scale]
                })
            angel++;
            if (angel < 360) {
                this.animate(program, locations, rectangleSettings, angel)
            }
        })
    }

    drawScene(program, locations, rectangleSettings) {
        resizeCanvas(this.gl.canvas);
        this.clearCanvas()

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.useProgram(program)
        this.gl.enableVertexAttribArray(locations.positionLocation)

        // this.setRectangle(
        //     rectangleSettings.translation[0], rectangleSettings.translation[0],
        //     rectangleSettings.width, rectangleSettings.height
        // )

        const size = 2;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.vertexAttribPointer(locations.positionLocation, size, type, normalize, stride, offset)
        this.gl.uniform2f(locations.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.uniform4fv(locations.colorLocation, rectangleSettings.color)

        const translationMatrix = m3.translation(rectangleSettings.translation[0], rectangleSettings.translation[1])
        const rotationMatrix = m3.rotation(...rectangleSettings.rotation)
        const scaleMatrix = m3.scaling(...rectangleSettings.scale)
        const moveOriginalMatrix = m3.translation(50, -75)

        const projectionMatrix = m3.projection(this.gl.canvas.width, this.gl.canvas.height)
        let matrix = m3.identity;
        // for (let i = 0; i < 5; i++) {
        //     matrix = m3.multiply(matrix, translationMatrix)
        //     matrix = m3.multiply(matrix, rotationMatrix)
        //     matrix = m3.multiply(matrix, scaleMatrix)
        //     matrix = m3.multiply(matrix, moveOriginalMatrix)
        //
        //     this.gl.uniformMatrix3fv(locations.matrixLocation,false,  matrix)
        //     this.drawPrimitive(18)
        // }

        matrix = m3.multiply(matrix, projectionMatrix)
        matrix = m3.translate(matrix, rectangleSettings.translation[0], rectangleSettings.translation[1])
        matrix = m3.rotate(matrix, ...rectangleSettings.rotation)
        matrix = m3.scale(matrix, ...rectangleSettings.scale)
        matrix = m3.translate(matrix, 50, -70)
        this.gl.uniformMatrix3fv(locations.matrixLocation,false,  matrix)
        this.drawPrimitive(18)

    }

    setGeometry(x, y) {
        const width = 100
        const height = 150
        const thickness = 30
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            x, y,
            x + thickness, y,
            x, y + height,
            x, y + height,
            x + thickness, y,
            x + thickness, y + height,

            x + thickness, y,
            x + width, y,
            x + thickness, y + thickness,
            x + thickness, y + thickness,
            x + width, y,
            x + width, y + thickness,

            x + thickness, y + thickness * 2,
            x + width * 2 / 3, y + thickness * 2,
            x + thickness, y + thickness * 3,
            x + thickness, y + thickness * 3,
            x + width * 2 / 3, y + thickness * 2,
            x + width * 2 / 3, y + thickness * 3,
        ]), this.gl.STATIC_DRAW)
    }

    setRectangle(x, y, width, height) {
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        ]), this.gl.STATIC_DRAW)
    }

    drawPrimitive(count, type, offset = 0) {
        const primitiveType = type ?? this.gl.TRIANGLES
        this.gl.drawArrays(primitiveType, offset, count)
    }

    clearCanvas() {
        this.gl.clearColor(0,0,0,0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }

    loadShaderSources() {
        const vertex$ = fetch('vertex-shader-2d.glsl')
            .then((response) => response.text() )
        const fragment$ = fetch('fragment-shader-2d.glsl')
            .then((response) => response.text() )
        return Promise.all([vertex$, fragment$])
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(this.gl.getShaderInfoLog(shader))
        this.gl.deleteShader(shader)
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram()
        this.gl.attachShader(program, vertexShader)
        this.gl.attachShader(program, fragmentShader)
        this.gl.linkProgram(program)
        const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS)
        if (success) {
            return program
        }

        console.log(this.gl.getProgramInfoLog(program))
        this.gl.deleteProgram(program)
    }
}
