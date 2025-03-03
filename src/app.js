import * as THREE from 'three';
// import './style.css';
// @ts-ignore
import { DigitalGlitch, OrbitControls } from 'three/examples/jsm/Addons.js';
// @ts-ignore
import fragmentShader from './shaders/fragment.glsl';
// @ts-ignore
import vertexShader from './shaders/vertex.glsl';
import FontFaceObserver from 'fontfaceobserver';
import imagesLoaded from 'imagesloaded';
import Scroll from './scroll';
import gsap from 'gsap';

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

        // @ts-ignore
        const preloadImages = new Promise((resolve, reject) => {
            imagesLoaded(
                document.querySelectorAll('img'),
                { background: true },
                resolve
            );
        });

        const allDone = [fontOpen, fontPlayfair, preloadImages];
        this.currentScroll = 0;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        Promise.all(allDone).then(() => {
            this.scroll = new Scroll();
            this.addImages();
            this.resize();
            this.setPositions();

            this.onPointerMove();
            this.setupResize();
            this.addObject();
            this.render();
            // @ts-ignore
            window.addEventListener('scroll', (t) => {
                this.currentScroll = window.scrollY;
                this.setPositions();
            });
        });
    }
    onPointerMove() {
        window.addEventListener('mousemove', (event) => {
            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components

            this.mouse.x = (event.clientX / this.width) * 2 - 1;
            this.mouse.y = -(event.clientY / this.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);

            const intersects = this.raycaster.intersectObjects(
                this.scene.children
            );

            if (intersects.length > 0) {
                const obj = intersects[0].object;
                // @ts-ignore
                obj.material.uniforms.uHover.value = intersects[0].uv;
            }
        });
    }
    // this.intersects = 0;
    addImages() {
        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            // side: THREE.DoubleSide,
            // wireframe: true,
            uniforms: {
                time: { value: 0 },
                uImage: { value: 0 },
                uHover: { value: new THREE.Vector2(0.5, 0.5) },
                uHoverState: { value: 0 },
            },
        });
        this.materials = [];
        this.imageStore = this.images.map((img) => {
            let bounds = img.getBoundingClientRect();
            let geometry = new THREE.PlaneGeometry(
                bounds.width,
                bounds.height,
                100,
                100
            );
            let texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            let material = this.material?.clone();

            // @ts-ignore
            img.addEventListener('mouseenter', (event) => {
                // @ts-ignore
                gsap.to(material?.uniforms.uHoverState, {
                    duration: 1,
                    value: 1,
                });
            });
            // @ts-ignore
            img.addEventListener('mouseleave', (event) => {
                // @ts-ignore
                gsap.to(material?.uniforms.uHoverState, {
                    duration: 1,
                    value: 0,
                });
            });

            this.materials?.push(material);

            if (material) {
                material.uniforms.uImage.value = texture;
            }

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
                100,
                100
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
                uImage: { value: 0 },
                uHover: { value: new THREE.Vector2(0.5, 0.5) },
                uHoverState: { value: 0 },
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

        this.materials?.forEach((m) => {
            m.uniforms.time.value = this.time;
        });

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.getElementById('container'),
});
