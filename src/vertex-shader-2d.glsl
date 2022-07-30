attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;
uniform float u_fudgeFactor;

varying vec4 v_color;
void main() {
    vec4 position = u_matrix * a_position;

    // define z to create perspective
    float zToDivideBy = 1.0 + position.z * u_fudgeFactor;

    gl_Position = vec4(position.xyz, zToDivideBy);

    // send color into the fragment shader
    v_color = a_color;
}
