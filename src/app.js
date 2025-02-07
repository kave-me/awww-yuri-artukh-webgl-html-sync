import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
// @ts-ignore
import fragmentShader from './shaders/fragment.glsl';
// @ts-ignore
import vertexShader from './shaders/vertex.glsl';

export default class Sketch {
    constructor(options) {
        this.time = 0;

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            0.01,
            10
        );
        this.camera.position.z = 1;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );

        // enable damping
        this.controls.enableDamping = true;

        this.resize();
        this.setupResize();
        this.addObject();
        this.render();
    }
    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }
    addObject() {
        this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        // this.material = new THREE.MeshNormalMaterial();

        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    render() {
        this.time += 0.05;
        // console.log(this.time)
        // @ts-ignore
        this.mesh.rotation.x = this.time / 20;
        // @ts-ignore
        this.mesh.rotation.y = this.time / 10;

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.getElementById('container'),
});
