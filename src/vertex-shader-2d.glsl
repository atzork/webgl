attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_transition;
void main() {
    // добавляем перенос
    vec2 position = a_position + u_transition;

    // преобразуем из пикселей в диапазон 0.0..1.0
    vec2 zeroToOne = position / u_resolution;

    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
