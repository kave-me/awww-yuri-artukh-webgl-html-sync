varying float vNoise;
varying vec2 vUv;
uniform sampler2D uImage;
void main() {

    vec2 newUv = vUv;
    vec4 texture = texture2D(uImage, newUv);
    gl_FragColor = vec4(vUv,0., 1.);
    gl_FragColor = vec4(vNoise, 0., 0., 1.);
    gl_FragColor = texture;
    gl_FragColor.rgb += 0.1 * vec3(vNoise );
}
