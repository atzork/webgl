attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;

varying vec4 v_color;
void main() {
    gl_Position = u_matrix * a_position;

    // send color into the fragment shader
    v_color = a_color;
}
