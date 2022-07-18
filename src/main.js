const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')
if (!gl) {
    console.log('WebGL does not work!!')
}

resize(canvas)

const vertexShaderSource = document.getElementById('vertical-shader-2d').innerText
const fragmentShaderSource = document.getElementById('fragment-shader-2d').innerText

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

const program = createProgram(gl, vertexShader, fragmentShader)

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30,
                ]
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// clear canvas
gl.clearColor(0,0,0,0);
gl.clear(gl.COLOR_BUFFER_BIT)

gl.useProgram(program)

gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

gl.enableVertexAttribArray(positionAttributeLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
const size = 2
const type = gl.FLOAT
const normalize = false
const stride = 0
let offset = 0
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

const primitiveType = gl.TRIANGLES
offset = 0
const count = 6
gl.drawArrays(primitiveType, offset, count)

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) {
        return program
    }

    console.log(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
}

function resize(canvas) {
    // получаем размер HTML-элемента canvas
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // проверяем, отличается ли размер canvas
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {

        // подгоняем размер буфера отрисовки под размер HTML-элемента
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}