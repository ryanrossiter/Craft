#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform mat4 matrix;
uniform vec3 camera;
uniform float fog_distance;
uniform int ortho;
uniform float timer;

attribute vec4 position;
attribute vec3 normal;
attribute vec4 uv;
attribute vec2 ws;
attribute vec3 block_pos;

varying vec2 fragment_uv;
varying float fragment_ao;
varying float fragment_light;
varying float fog_factor;
varying float fog_height;
varying float diffuse;
varying float w;
varying float opacity;

const float pi = 3.14159265;
vec3 light_direction = normalize(vec3(-1.0, 1.0, -1.0));

void main() {
    opacity = 1.;
    w = ws.x;
    int w = int(ws.x);
    int face_mask = int(ws.y);
    bool back = face_mask >= 32;
    if (back) face_mask -= 32;
    bool front = face_mask >= 16;
    if (front) face_mask -= 16;
    bool bottom = face_mask >= 8;
    if (bottom) face_mask -= 8;
    bool top = face_mask >= 4;
    if (top) face_mask -= 4;
    bool right = face_mask >= 2;
    if (right) face_mask -= 2;
    bool left = face_mask >= 1;
    if (left) face_mask -= 1;
    // if (face_mask != 0) // should be 0

    float camera_distance = distance(camera, vec3(position));
    float r = pow(camera_distance / fog_distance * 4., 4.);
    vec4 pos_off = vec4(0., -r, 0., 0.);
    float o = 0.;

    if (w == 12) { // water
        float f = 0.01;
        if (!bottom || block_pos.y > 0.) {
            // only distort the bottom if the bottom vertices if the bottom face is showing
            o = abs(sin(position.x + position.z + timer * 200.) * 0.2);
        }

        if (!bottom && block_pos.y < 0.) {
            // if the vertex is on the bottom and there isn't a face under it,
            // move the vertices down slightly to fill in the gap from changing pos_off
            o += 0.1;
            f += 0.005;
        }
        pos_off -= vec4(normal * f, 0.);
    }

    pos_off.y -= o;
    gl_Position = matrix * (position + pos_off);

    fragment_uv = uv.xy;
    fragment_ao = 0.3 + (1.0 - uv.z) * 0.7;
    fragment_light = uv.w;
    if (top && sign(block_pos.y) == sign(normal.y)) fragment_light -= o;
    diffuse = max(0.0, dot(normal, light_direction));
    if (bool(ortho)) {
        fog_factor = 0.0;
        fog_height = 0.0;
    }
    else {
        
        fog_factor = pow(clamp(camera_distance / fog_distance, 0.0, 1.0), 4.0);
        float dy = position.y - camera.y;
        float dx = distance(position.xz, camera.xz);
        fog_height = (atan(dy, dx) + pi / 2.0) / pi;
    }
}
