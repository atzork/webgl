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

const m4 = {
    translation: (tx, ty, tz) => [
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz, 1,
    ],

    xRotation: (s, c) =>  [
        1,  0, 0, 0,
        0,  c, s, 0,
        0, -s, c, 0,
        0,  0, 0, 1
    ],

    yRotation: (s, c) =>  [
        c, 0, -s, 0,
        0, 1,  0, 0,
        s, 0,  c, 0,
        0, 0,  0, 1
    ],

    zRotation: (s, c) =>  [
         c, s, 0, 0,
        -s, c, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1
    ],

    scaling: (sx, sy, sz) => [
        sx, 0,  0,  0,
        0,  sy, 0,  0,
        0,  0,  sz, 0,
        0,  0,  0,  1
    ],

    projection: (width, height, depth) => [
         2 / width,  0,           0,         0,
         0,         -2 / height,  0,         0,
         0,          0,           2 / depth, 0,
        -1,          1,           0,         1
    ],

    translate: (m, tx, ty, tz) => m4.multiply(m, m4.translation(tx, ty, tz)),
    xRotate: (m, s, c) => m4.multiply(m, m4.xRotation(s, c)),
    yRotate: (m, s, c) => m4.multiply(m, m4.yRotation(s, c)),
    zRotate: (m, s, c) => m4.multiply(m, m4.zRotation(s, c)),
    scale: (m, sx, sy, sz) => m4.multiply(m, m4.scaling(sx, sy, sz)),

    identity: [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ],

    multiply: (a, b) => {
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];
        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,

            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,

            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,

            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
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
                colorLocation: this.gl.getUniformLocation(program, 'u_color'),
                matrixLocation: this.gl.getUniformLocation(program, 'u_matrix')
            }
            const positionBuffer = this.gl.createBuffer();
            const rectangleSettings = {
                translation: [300, 300],
                rotation: getSinCosByAngleDeg(220),
                scale: [1, 1],
                translation3D: [300, 300, 1],
                rotation3D: [getSinCosByAngleDeg(0), getSinCosByAngleDeg(45), getSinCosByAngleDeg(0)],
                scale3D: [1, 1, 1],
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
            // const rotation3D = [getSinCosByAngleDeg(angel), rectangleSettings.rotation3D[0], rectangleSettings.rotation3D[2]]
            // const rotation3D = [rectangleSettings.rotation3D[0], getSinCosByAngleDeg(angel), rectangleSettings.rotation3D[2]]
            // const rotation3D = [rectangleSettings.rotation3D[0], rectangleSettings.rotation3D[2], getSinCosByAngleDeg(angel)]
            const rotation3D = [getSinCosByAngleDeg(angel), rectangleSettings.rotation3D[0], getSinCosByAngleDeg(angel)]
            const scale = angel < 180 ? Math.max(angel / 20, 1) : Math.max((360 - angel) / 20, 1)
            this.drawScene(
                program, locations,
                {...rectangleSettings,
                    rotation: rotation,
                    rotation3D: rotation3D,
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

        const size = 3; // 2 -> 2D; 3 -> 3D
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.vertexAttribPointer(locations.positionLocation, size, type, normalize, stride, offset)
        this.gl.uniform4fv(locations.colorLocation, rectangleSettings.color)

        // 2D
        // const projectionMatrix = m3.projection(this.gl.canvas.width, this.gl.canvas.height)
        // let matrix = m3.identity;
        // matrix = m3.multiply(matrix, projectionMatrix)
        // matrix = m3.translate(matrix, rectangleSettings.translation[0], rectangleSettings.translation[1])
        // matrix = m3.rotate(matrix, ...rectangleSettings.rotation)
        // matrix = m3.scale(matrix, ...rectangleSettings.scale)
        // matrix = m3.translate(matrix, 50, -70)
        // this.gl.uniformMatrix3fv(locations.matrixLocation,false,  matrix)

        // 3D
        let matrix = m4.projection(this.gl.canvas.width, this.gl.canvas.height, 400)
        matrix = m4.translate(matrix, ...rectangleSettings.translation3D)
        matrix = m4.xRotate(matrix, ...rectangleSettings.rotation3D[0])
        matrix = m4.yRotate(matrix, ...rectangleSettings.rotation3D[1])
        matrix = m4.zRotate(matrix, ...rectangleSettings.rotation3D[2])
        matrix = m4.scale(matrix, ...rectangleSettings.scale3D)
        this.gl.uniformMatrix4fv(locations.matrixLocation, false, matrix)

        this.drawPrimitive(18)
    }

    setGeometry(x, y) {
        const width = 100
        const height = 150
        const thickness = 30
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            x, y, 0,
            x + thickness, y, 0,
            x, y + height, 0,
            x, y + height, 0,
            x + thickness, y, 0,
            x + thickness, y + height, 0,

            x + thickness, y, 0,
            x + width, y, 0,
            x + thickness, y + thickness, 0,
            x + thickness, y + thickness, 0,
            x + width, y, 0,
            x + width, y + thickness, 0,

            x + thickness, y + thickness * 2, 0,
            x + width * 2 / 3, y + thickness * 2, 0,
            x + thickness, y + thickness * 3, 0,
            x + thickness, y + thickness * 3, 0,
            x + width * 2 / 3, y + thickness * 2, 0,
            x + width * 2 / 3, y + thickness * 3, 0,
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
