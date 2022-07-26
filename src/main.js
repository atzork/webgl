import { m4 } from './utils/matrix-utils.js'
import { resizeCanvas } from './utils/dom-utils.js'
import { getSinCosByAngleDeg } from "./utils/math-utils.js";

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
                color: [Math.random(),Math.random(),Math.random(),1],
                vertex: 16 * 6 // 16 rectangles * 2 triangles * 3 vertex
            }
            this.gl.useProgram(program)
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
            // this.setGeometry(rectangleSettings.x, rectangleSettings.y)
            this.setGeometryFull3D()
            this.drawScene(locations, rectangleSettings);
            this.animate(locations, rectangleSettings, 0)
        })
    }

    drawScene(locations, rectangleSettings) {
        resizeCanvas(this.gl.canvas);
        this.clearCanvas()

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

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

        this.drawPrimitive(rectangleSettings.vertex)
    }

    animate(locations, rectangleSettings, angel) {
        requestAnimationFrame(() => {
            const rotation = getSinCosByAngleDeg(angel)
            // const scale = angel < 180 ? Math.max(angel / 20, 1) : Math.max((360 - angel) / 20, 1)
            // const rotation3D = [getSinCosByAngleDeg(angel), rectangleSettings.rotation3D[0], rectangleSettings.rotation3D[2]]
            // const rotation3D = [rectangleSettings.rotation3D[0], getSinCosByAngleDeg(angel), rectangleSettings.rotation3D[2]]
            // const rotation3D = [rectangleSettings.rotation3D[0], rectangleSettings.rotation3D[2], getSinCosByAngleDeg(angel)]
            const rotation3D = [getSinCosByAngleDeg(angel), rectangleSettings.rotation3D[0], getSinCosByAngleDeg(angel)]
            this.drawScene(
                locations,
                {...rectangleSettings,
                    rotation: rotation,
                    rotation3D: rotation3D,
                    color: [rotation[0], rotation[1],rotation[1],1],
                    // scale: [scale, scale]
                })
            angel++;
            if (angel < 360) {
                this.animate(locations, rectangleSettings, angel)
            }
        })
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

    setGeometryFull3D() {
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            // left column front
            0,   0,  0,
            30,   0,  0,
            0, 150,  0,
            0, 150,  0,
            30,   0,  0,
            30, 150,  0,

            // top rung front
            30,   0,  0,
            100,   0,  0,
            30,  30,  0,
            30,  30,  0,
            100,   0,  0,
            100,  30,  0,

            // middle rung front
            30,  60,  0,
            67,  60,  0,
            30,  90,  0,
            30,  90,  0,
            67,  60,  0,
            67,  90,  0,

            // left column back
            0,   0,  30,
            30,   0,  30,
            0, 150,  30,
            0, 150,  30,
            30,   0,  30,
            30, 150,  30,

            // top rung back
            30,   0,  30,
            100,   0,  30,
            30,  30,  30,
            30,  30,  30,
            100,   0,  30,
            100,  30,  30,

            // middle rung back
            30,  60,  30,
            67,  60,  30,
            30,  90,  30,
            30,  90,  30,
            67,  60,  30,
            67,  90,  30,

            // top
            0,   0,   0,
            100,   0,   0,
            100,   0,  30,
            0,   0,   0,
            100,   0,  30,
            0,   0,  30,

            // top rung right
            100,   0,   0,
            100,  30,   0,
            100,  30,  30,
            100,   0,   0,
            100,  30,  30,
            100,   0,  30,

            // under top rung
            30,   30,   0,
            30,   30,  30,
            100,  30,  30,
            30,   30,   0,
            100,  30,  30,
            100,  30,   0,

            // between top rung and middle
            30,   30,   0,
            30,   30,  30,
            30,   60,  30,
            30,   30,   0,
            30,   60,  30,
            30,   60,   0,

            // top of middle rung
            30,   60,   0,
            30,   60,  30,
            67,   60,  30,
            30,   60,   0,
            67,   60,  30,
            67,   60,   0,

            // right of middle rung
            67,   60,   0,
            67,   60,  30,
            67,   90,  30,
            67,   60,   0,
            67,   90,  30,
            67,   90,   0,

            // bottom of middle rung.
            30,   90,   0,
            30,   90,  30,
            67,   90,  30,
            30,   90,   0,
            67,   90,  30,
            67,   90,   0,

            // right of bottom
            30,   90,   0,
            30,   90,  30,
            30,  150,  30,
            30,   90,   0,
            30,  150,  30,
            30,  150,   0,

            // bottom
            0,   150,   0,
            0,   150,  30,
            30,  150,  30,
            0,   150,   0,
            30,  150,  30,
            30,  150,   0,

            // left side
            0,   0,   0,
            0,   0,  30,
            0, 150,  30,
            0,   0,   0,
            0, 150,  30,
            0, 150,   0]), this.gl.STATIC_DRAW)
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
