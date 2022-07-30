import { m4 } from './utils/matrix-utils.js'
import { resizeCanvas } from './utils/dom-utils.js'
import { getSinCosByAngleDeg } from "./utils/math-utils.js";

export default class Main {
    gl;
    positionBuffer; colorBuffer;
    locations; rectangleSettings;

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

        this.handleEvents(this.gl.canvas);

        this.loadShaderSources().then(([vertexShaderSource, fragmentShaderSource]) => {
            const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource)

            const program = this.createProgram(vertexShader, fragmentShader)
            this.locations = {
                positionLocation: this.gl.getAttribLocation(program, 'a_position'),
                colorLocation: this.gl.getAttribLocation(program, 'a_color'),
                matrixLocation: this.gl.getUniformLocation(program, 'u_matrix'),
                fudgeLocation: this.gl.getUniformLocation(program, 'u_fudgeFactor')
            }
            this.rectangleSettings = {
                translation: [300, 300],
                rotation: 220,
                scale: [1, 1],
                translation3D: [300, 300, 1],
                rotation3D: [20, 20, 20],
                scale3D: [1, 1, 1],
                x: 10, y: 20,
                width: 100,
                height: 30,
                color: [Math.random(),Math.random(),Math.random(),1],

                vertex: 16 * 6, // 16 rectangles * 2 triangles * 3 vertex
                fudgeFactor: 1
            }
            this.gl.useProgram(program)

            this.initPositionLocation(this.locations.positionLocation)
            this.initColorLocation(this.locations.colorLocation)

            this.drawScene(this.locations, this.rectangleSettings);
            this.animate()
        })
    }

    drawScene(locations, rectangleSettings) {
        resizeCanvas(this.gl.canvas);

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.clearCanvas()


        const left = 0;
        const right = this.gl.canvas.clientWidth;
        const bottom = this.gl.canvas.clientHeight;
        const top = 0;
        const near = 400;
        const far = -400;
        // let matrix = m4.projection(this.gl.canvas.width, this.gl.canvas.height, 400)
        // let matrix = m4.orthographic(left, right, bottom, top, near, far);
        let matrix = m4.perspective(rectangleSettings.fudgeFactor);
        matrix = m4.multiply(matrix, m4.projection(this.gl.canvas.width, this.gl.canvas.height, 400))
        matrix = m4.translate(matrix, ...rectangleSettings.translation3D)
        matrix = m4.xRotate(matrix, rectangleSettings.rotation3D[0])
        matrix = m4.yRotate(matrix, rectangleSettings.rotation3D[1])
        matrix = m4.zRotate(matrix, rectangleSettings.rotation3D[2])
        matrix = m4.scale(matrix, ...rectangleSettings.scale3D)
        this.gl.uniformMatrix4fv(locations.matrixLocation, false, matrix)

        this.gl.enable(this.gl.CULL_FACE)
        this.gl.enable(this.gl.DEPTH_TEST)

        this.drawPrimitive(rectangleSettings.vertex)
    }

    initPositionLocation(positionLocation) {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
        this.setGeometryFull3D()
        const positionSize = 3; // 2 -> 2D; 3 -> 3D
        const positionType = this.gl.FLOAT;
        const positionNormalize = false;
        const positionStride = 0;
        const positionOffset = 0;
        this.gl.enableVertexAttribArray(positionLocation)
        this.gl.vertexAttribPointer(positionLocation, positionSize, positionType, positionNormalize, positionStride, positionOffset)
    }

    initColorLocation(colorLocation) {
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.setColors()
        const colorSize = 3; // 2 -> 2D; 3 -> 3D
        const colorType = this.gl.UNSIGNED_BYTE;
        const colorNormalize = true;
        const colorStride = 0;
        const colorOffset = 0;
        this.gl.enableVertexAttribArray(colorLocation)
        this.gl.vertexAttribPointer(colorLocation, colorSize, colorType, colorNormalize, colorStride, colorOffset)
    }

    animate(angel = 0) {
        requestAnimationFrame(() => {
            this.rectangleSettings.rotation = angel
            // const scale = angel < 180 ? Math.max(angel / 20, 1) : Math.max((360 - angel) / 20, 1)
            // const rotation3D = [getSinCosByAngleDeg(angel), rectangleSettings.rotation3D[0], rectangleSettings.rotation3D[2]]
            // const rotation3D = [rectangleSettings.rotation3D[0], getSinCosByAngleDeg(angel), rectangleSettings.rotation3D[2]]
            // const rotation3D = [rectangleSettings.rotation3D[0], rectangleSettings.rotation3D[2], getSinCosByAngleDeg(angel)]
            this.rectangleSettings.rotation3D = [
                angel,
                this.rectangleSettings.rotation3D[1],
                angel,
            ]
            const [r, g] = getSinCosByAngleDeg(angel)
            this.rectangleSettings.color = [
                r,
                g,
                g,
                1
            ]
            this.drawScene(this.locations,this.rectangleSettings)
            angel++;
            if (angel < 360) {
                this.animate(angel)
            }
        })
    }

    handleEvents() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                    event.preventDefault();
                    requestAnimationFrame(() => {
                        this.rectangleSettings.translation3D[2] += 10
                        this.drawScene(this.locations, this.rectangleSettings);
                    })
                    break
                case 'ArrowDown':
                    event.preventDefault();
                    requestAnimationFrame(() => {
                        this.rectangleSettings.translation3D[2] -= 10
                        this.drawScene(this.locations, this.rectangleSettings);
                    })
                    break
                case 'ArrowLeft':
                    event.preventDefault();
                    requestAnimationFrame(() => {
                        this.rectangleSettings.rotation3D[2] += 1;
                        this.drawScene(this.locations, this.rectangleSettings);
                    })
                    break
                case 'ArrowRight':
                    event.preventDefault();
                    requestAnimationFrame(() => {
                        this.rectangleSettings.rotation3D[2] -= 1;
                        this.drawScene(this.locations, this.rectangleSettings);
                    })
                    break
                default:
                    break
            }
        })
    }

    setColors() {
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array([
            // left column front
            200,  70, 120,
            200,  70, 120,
            200,  70, 120,
            200,  70, 120,
            200,  70, 120,
            200,  70, 120,

            // top rung front
            200,  70, 120,
            200,  70, 120,
            200,  70, 120,
            200,  70, 120,
            200,  70, 120,
            200,  70, 120,

            // middle rung front
            200,  70, 120,
            0,  0, 170,
            0,  170, 0,
            100,  70, 120,
            100,  70, 120,
            200,  70, 120,

            // left column back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // middle rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,

            // top rung right
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,

            // under top rung
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,

            // between top rung and middle
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,

            // top of middle rung
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,

            // right of middle rung
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,

            // bottom of middle rung.
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,

            // right of bottom
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,

            // bottom
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,

            // left side
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220
        ]), this.gl.STATIC_DRAW)
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
            0, 150,  0,
            30,   0,  0,
            0, 150,  0,
            30, 150,  0,
            30,   0,  0,

            // top rung front
            30,   0,  0,
            30,  30,  0,
            100,   0,  0,
            30,  30,  0,
            100,  30,  0,
            100,   0,  0,

            // middle rung front
            30,  60,  0,
            30,  90,  0,
            67,  60,  0,
            30,  90,  0,
            67,  90,  0,
            67,  60,  0,

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
            30,   60,  30,
            30,   30,  30,
            30,   30,   0,
            30,   60,   0,
            30,   60,  30,

            // top of middle rung
            30,   60,   0,
            67,   60,  30,
            30,   60,  30,
            30,   60,   0,
            67,   60,   0,
            67,   60,  30,

            // right of middle rung
            67,   60,   0,
            67,   90,  30,
            67,   60,  30,
            67,   60,   0,
            67,   90,   0,
            67,   90,  30,

            // bottom of middle rung.
            30,   90,   0,
            30,   90,  30,
            67,   90,  30,
            30,   90,   0,
            67,   90,  30,
            67,   90,   0,

            // right of bottom
            30,   90,   0,
            30,  150,  30,
            30,   90,  30,
            30,   90,   0,
            30,  150,   0,
            30,  150,  30,

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
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
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
