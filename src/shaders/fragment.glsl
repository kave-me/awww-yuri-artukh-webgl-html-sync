varying float vNoise;
varying vec2 vUv;
void main() {
    vec3 color1 = vec3(1., 0., 0.);
    vec3 color2 = vec3(1., 1., 1.);
    vec3 finalColor = mix(color1, color2, vec3(0.5 * (vNoise + 1.0)));

    // gl_FragColor = vec4(finalColor, 1.0);
    gl_FragColor = vec4(vUv, 0., 1.0);
}
