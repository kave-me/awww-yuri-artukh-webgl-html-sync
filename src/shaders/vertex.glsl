#include "noise.glsl"

uniform float time;
varying float vNoise;
varying vec2 vUv;
void main() {
    vec3 newPosition = position;
    // newPosition.z += 0.35 * sin(position.x * 20.);
    // newPosition.z += 0.1 * cnoise( vec3(position.x*4., position.y*4., 0. ));

    float PI = 3.14159265359;
    // newPosition.z += 0.1 * sin(() * sin((position.y+ 0.25)*2.*PI);
    // newPosition.z += 0.5 * sin((position.x+ 0.25)*2.*PI + time);
    // newPosition.y += 0.5 * cos((position.y+ 0.25)*2.*PI+ time);
    // newPosition.z = 0.15 * noise;

    float noise =  cnoise(vec3(position.x*4., position.y*4. + time/5.,0));
    vNoise = noise;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
