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
                transitionLocation: this.gl.getUniformLocation(program, 'u_transition')
            }
            const positionBuffer = this.gl.createBuffer();
            const rectangleSettings = {
                translation: [33, 220],
                x: 0, y: 0,
                width: 100,
                height: 30,
                color: [Math.random(),Math.random(),Math.random(),1]
            }

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
            this.setGeometry(rectangleSettings.x,rectangleSettings.y)
            this.drawScene(program, locations, rectangleSettings);
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
        this.gl.uniform2fv(locations.transitionLocation, rectangleSettings.translation)
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
