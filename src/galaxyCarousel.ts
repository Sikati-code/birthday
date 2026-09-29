import * as THREE from 'three';

export class GalaxyCarousel {
    private container: HTMLElement;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private carouselGroup: THREE.Group;
    private starSystem: THREE.Points;

    private isPointerDown = false;
    private previousPointerX = 0;
    private autoRotateSpeed = 0.002;

    private animationId: number = 0;
    private isRunning = false;

    constructor(containerId: string, imageUrls: string[]) {
        this.container = document.getElementById(containerId)!;

        // Hide original DOM slideshow (so legacy classes don't crash)
        const v = this.container.querySelector('.slideshow-viewport') as HTMLElement;
        if (v) v.style.display = 'none';
        const r = this.container.querySelector('.filmstrip-thumbnail-ribbon') as HTMLElement;
        if (r) r.style.display = 'none';
        const btns = this.container.parentElement?.querySelectorAll('.slide-nav-btn') || [];
        btns.forEach((b) => (b as HTMLElement).style.display = 'none');

        this.container.style.cursor = 'grab';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.minHeight = '600px';

        // 1. Setup Scene, Camera, Renderer
        this.scene = new THREE.Scene();

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 10);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 2. Carousel Group
        this.carouselGroup = new THREE.Group();
        this.scene.add(this.carouselGroup);

        this.loadPhotos(imageUrls);
        this.starSystem = this.createStardust();
        this.scene.add(this.starSystem);

        // Bind Methods
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);

        // Listeners
        window.addEventListener('resize', this.onWindowResize);
        this.container.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
    }

    private loadPhotos(urls: string[]) {
        const textureLoader = new THREE.TextureLoader();
        const planeGeometry = new THREE.PlaneGeometry(3.5, 4.8); // Portrait proportion

        const radius = 4.5;
        const count = urls.length;

        for (let i = 0; i < count; i++) {
            textureLoader.load(urls[i], (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true
                });

                const mesh = new THREE.Mesh(planeGeometry, material);

                // Distribute on circle
                const angle = (i / count) * Math.PI * 2;
                mesh.position.x = Math.cos(angle) * radius;
                mesh.position.z = Math.sin(angle) * radius;

                // Look away from center
                mesh.rotation.y = -angle + Math.PI / 2;

                this.carouselGroup.add(mesh);
            });
        }
    }

    private createStardust(): THREE.Points {
        const starCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        const tc = new THREE.Color();

        for (let i = 0; i < starCount; i++) {
            // Distribute in a spherical volume
            const r = Math.random() * 15;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Randomly assign gold or white
            if (Math.random() > 0.5) {
                tc.setHex(0xF5D77F); // Gold
            } else {
                tc.setHex(0xFFFFFF); // White
            }

            colors[i * 3] = tc.r;
            colors[i * 3 + 1] = tc.g;
            colors[i * 3 + 2] = tc.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Load a circular texture for points to make them soft (or fallback to square)
        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Points(geometry, material);
    }

    private onPointerDown(e: PointerEvent) {
        this.isPointerDown = true;
        this.previousPointerX = e.clientX;
        this.container.style.cursor = 'grabbing';
    }

    private onPointerMove(e: PointerEvent) {
        if (!this.isPointerDown) return;
        const deltaX = e.clientX - this.previousPointerX;
        this.previousPointerX = e.clientX;

        this.carouselGroup.rotation.y += deltaX * 0.005;
    }

    private onPointerUp() {
        this.isPointerDown = false;
        this.container.style.cursor = 'grab';
    }

    private onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    public start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    public stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    }

    private animate() {
        if (!this.isRunning) return;

        // Auto-rotation when not dragging
        if (!this.isPointerDown) {
            this.carouselGroup.rotation.y += this.autoRotateSpeed;
        }

        // Ethereal floating effect for the group
        this.carouselGroup.position.y = Math.sin(Date.now() * 0.001) * 0.2;

        // Slowly rotate stardust independently (paralax)
        this.starSystem.rotation.y += 0.0005;
        this.starSystem.rotation.x += 0.0002;

        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.animate);
    }
}
