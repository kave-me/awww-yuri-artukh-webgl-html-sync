import * as THREE from 'three';
// import './style.css';
import { DigitalGlitch, OrbitControls } from 'three/examples/jsm/Addons.js';
// @ts-ignore
import fragmentShader from './shaders/fragment.glsl';
// @ts-ignore
import vertexShader from './shaders/vertex.glsl';
import FontFaceObserver from 'fontfaceobserver';
import imagesLoaded from 'imagesloaded';
import Scroll from './scroll';

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
            100,
            2000
        );

        const DISTANCE_TO_PLAIN = 600;
        this.camera.position.z = DISTANCE_TO_PLAIN;

        const cameraFov =
            2 *
            Math.atan(this.height / 2 / DISTANCE_TO_PLAIN) *
            (180 / Math.PI);
        this.camera.fov = cameraFov;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );

        this.images = [...document.querySelectorAll('img')];

        const fontOpen = new Promise((resolve) => {
            // @ts-ignore
            new FontFaceObserver('Open Sans').load().then(() => resolve());
        });
        const fontPlayfair = new Promise((resolve) => {
            // @ts-ignore
            new FontFaceObserver('Playfair Display')
                .load()
                // @ts-ignore
                .then(() => resolve());
        });

        const preloadImages = new Promise((resolve, reject) => {
            imagesLoaded(
                document.querySelectorAll('img'),
                { background: true },
                resolve
            );
        });

        const allDone = [fontOpen, fontPlayfair, preloadImages];
        this.currentScroll = 0;


        Promise.all(allDone).then(() => {
            this.scroll = new Scroll();
            this.addImages();
            this.resize();
            this.setPositions();
            this.setupResize();
            this.addObject();
            this.render();
            window.addEventListener('scroll', (t) => {
                this.currentScroll = window.scrollY;
                this.setPositions();
            });
        });
    }
    addImages() {
        this.imageStore = this.images.map((img) => {
            let bounds = img.getBoundingClientRect();
            let geometry = new THREE.PlaneGeometry(
                bounds.width,
                bounds.height,
                1,
                1
            );
            let texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            let material = new THREE.MeshBasicMaterial({
                // color: 0xff0000,
                map: texture,
            });
            let mesh = new THREE.Mesh(geometry, material);

            this.scene.add(mesh);
            return {
                img: img,
                mesh: mesh,
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height,
            };
        });
    }
    updateImageStore() {
        this.imageStore = this.images.map((img) => {
            let bounds = img.getBoundingClientRect();
            let mesh = this.imageStore.find((o) => o.img === img).mesh;

            // Update geometry to match the new size
            mesh.geometry.dispose();
            mesh.geometry = new THREE.PlaneGeometry(
                bounds.width,
                bounds.height,
                1,
                1
            );

            return {
                img: img,
                mesh: mesh,
                top: bounds.top + window.scrollY,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height,
            };
        });
    }
    setPositions() {
        this.imageStore?.forEach((o) => {
            o.mesh.position.y =
                this.currentScroll - o.top + this.height / 2 - o.height / 2;
            o.mesh.position.x = o.left - this.width / 2 + o.width / 2;
        });
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
        this.updateImageStore(); // Update image store with new positions and dimensions
        this.setPositions(); // Update positions after resizing
        console.log('resize');
    }
    addObject() {
        this.geometry = new THREE.PlaneGeometry(200, 400, 10, 10);
        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            side: THREE.DoubleSide,
            // wireframe: true,
            uniforms: {
                time: { value: 0 },
            },
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // this.scene.add(this.mesh);
    }

    render() {
        this.scroll.render();
        this.currentScroll = this.scroll.scrollToRender;
        this.setPositions();
        this.time += 0.05;
        // @ts-ignore
        this.material.uniforms.time.value = this.time;

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.getElementById('container'),
});
