import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';

// Import types only to avoid bundling Three.js code
import type {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  DirectionalLight,
} from 'three';

@Component({
  selector: 'app-three-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-viewer.component.html',
  styleUrl: './three-viewer.component.scss',
})
export class ThreeViewerComponent implements AfterViewInit, OnDestroy {
  @Input() modelUrl = '/assets/models/skateboard modelo 3d.glb';
  @Input() fallbackSrc = '/assets/tenis.png';
  @Input() fov = 40;
  @Input() minZoom = 2.5;
  @Input() maxZoom = 7;
  @Input() enableZoom = true;
  @Input() mobileQuality: 'low' | 'balanced' | 'high' = 'balanced';
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  // Three.js instances
  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private modelGroup!: Group;
  
  // Loaded modules
  private THREE: any;
  private GLTFLoader: any;
  private DRACOLoader: any;
  private KTX2Loader: any;
  private MeshoptDecoder: any;

  // Loaders instances
  private draco: any;
  private ktx2: any;
  private gltfLoader: any;

  showFallback = false;
  private frameId: number | null = null;
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  loading = true;
  private isAutoRotating = true;
  private isPageVisible = true;
  private isElementVisible = true;
  private isAnimating = false;
  private glContextLost = false;
  private intersectionObserver?: IntersectionObserver;
  private lastFrameTime = 0;
  private targetFPS = 30;
  private frameInterval = 1000 / 30;

  // Store bound event handlers for proper cleanup
  private boundResizeHandler?: () => void;
  private boundPointerMoveHandler?: (e: PointerEvent) => void;
  private boundPointerDownHandler?: (e: PointerEvent) => void;
  private boundPointerUpHandler?: (e: PointerEvent) => void;
  private boundWheelHandler?: (e: WheelEvent) => void;
  private boundVisibilityChangeHandler?: () => void;
  private boundContextLostHandler?: (e: Event) => void;
  private boundContextRestoredHandler?: (e: Event) => void;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    setTimeout(() => this.initializeViewer(), 0);
  }

  private async initializeViewer() {
    try {
      this.isPageVisible = !document.hidden;
      this.lastFrameTime = performance.now();

      // Lazy load Three.js and dependencies
      await this.loadThreeJS();

      this.initThree();
      this.loadModel();
      this.addEvents();
      this.onResize();
      this.animate();
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  private async loadThreeJS() {
    try {
      // Parallel loading of modules
      const [three, gltf, draco, ktx2, meshopt] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/loaders/DRACOLoader.js'),
        import('three/examples/jsm/loaders/KTX2Loader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js')
      ]);

      this.THREE = three;
      this.GLTFLoader = gltf.GLTFLoader;
      this.DRACOLoader = draco.DRACOLoader;
      this.KTX2Loader = ktx2.KTX2Loader;
      this.MeshoptDecoder = meshopt.MeshoptDecoder;
    } catch (error) {
      console.error('Failed to load Three.js dependencies:', error);
      throw error;
    }
  }

  private handleInitializationError(error: any) {
    console.error('Three.js initialization failed:', error);
    this.showFallback = true;
    this.loading = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.boundResizeHandler) {
      window.removeEventListener('resize', this.boundResizeHandler);
      this.boundResizeHandler = undefined;
    }

    if (this.boundVisibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.boundVisibilityChangeHandler);
      this.boundVisibilityChangeHandler = undefined;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }

    const el = this.containerRef?.nativeElement;
    if (el) {
      if (this.boundPointerMoveHandler) el.removeEventListener('pointermove', this.boundPointerMoveHandler);
      if (this.boundPointerDownHandler) el.removeEventListener('pointerdown', this.boundPointerDownHandler);
      if (this.boundPointerUpHandler) el.removeEventListener('pointerup', this.boundPointerUpHandler);
      if (this.boundWheelHandler) el.removeEventListener('wheel', this.boundWheelHandler);
    }

    if (this.renderer && this.renderer.domElement) {
      const canvas = this.renderer.domElement;
      if (this.boundContextLostHandler) canvas.removeEventListener('webglcontextlost', this.boundContextLostHandler);
      if (this.boundContextRestoredHandler) canvas.removeEventListener('webglcontextrestored', this.boundContextRestoredHandler);
    }

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.isAnimating = false;

    this.disposeScene();
    this.disposeRenderer();
    this.disposeLoaders();
    this.clearReferences();
  }

  private disposeScene() {
    if (!this.scene) return;

    this.scene.traverse((object: any) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) this.disposeMaterial(object.material);
    });

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  private disposeMaterial(material: any) {
    if (Array.isArray(material)) {
      material.forEach((mat) => this.disposeMaterial(mat));
      return;
    }

    if (!material) return;

    const textureProperties = [
      'map', 'normalMap', 'roughnessMap', 'metalnessMap',
      'emissiveMap', 'alphaMap', 'aoMap', 'displacementMap',
      'specularMap', 'envMap', 'bumpMap',
    ];

    textureProperties.forEach((prop) => {
      if (material[prop]) {
        material[prop].dispose?.();
        material[prop] = null;
      }
    });

    material.dispose?.();
  }

  private disposeRenderer() {
    if (this.renderer) {
      if (this.renderer.getContext()) {
        const gl = this.renderer.getContext();
        if (gl && gl.getExtension('WEBGL_lose_context')) {
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
      }

      this.renderer.dispose();

      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }

  private disposeLoaders() {
    if (this.draco) {
      this.draco.dispose();
      this.draco = undefined;
    }
    if (this.ktx2) {
      this.ktx2.dispose();
      this.ktx2 = undefined;
    }
    this.gltfLoader = undefined;
  }

  private clearReferences() {
    this.scene = undefined as any;
    this.camera = undefined as any;
    this.renderer = undefined as any;
    this.modelGroup = undefined as any;
    this.THREE = undefined;
  }

  private initThree() {
    if (!this.isWebGLAvailable()) {
      throw new Error('WebGL is not supported or disabled in your browser');
    }

    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLighting();
    this.setupModelGroup();
  }

  private setupScene() {
    this.scene = new this.THREE.Scene();
  }

  private setupCamera() {
    this.camera = new this.THREE.PerspectiveCamera(this.fov, 1, 0.01, 100);
    this.camera.position.set(0, 0, 4.5);
  }

  private setupRenderer() {
    try {
      this.renderer = new this.THREE.WebGLRenderer(this.getRendererConfig());
      this.configureRenderer();
      this.addCanvasToDOM();
      this.setupWebGLContextHandlers();
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      throw new Error('WebGL renderer creation failed');
    }
  }

  private setupWebGLContextHandlers() {
    const canvas = this.renderer.domElement;

    this.boundContextLostHandler = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost - attempting recovery');
      this.glContextLost = true;
      this.isAnimating = false;
      if (this.frameId !== null) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
    };

    this.boundContextRestoredHandler = () => {
      console.log('WebGL context restored - reinitializing');
      this.glContextLost = false;
      setTimeout(() => {
        try {
          this.reinitializeAfterContextLoss();
        } catch (error) {
          console.error('Failed to restore WebGL context:', error);
          this.showFallback = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      }, 100);
    };

    canvas.addEventListener('webglcontextlost', this.boundContextLostHandler);
    canvas.addEventListener('webglcontextrestored', this.boundContextRestoredHandler);
  }

  private async reinitializeAfterContextLoss() {
    if (this.renderer) {
      const oldCanvas = this.renderer.domElement;
      this.renderer.dispose();
      if (oldCanvas && oldCanvas.parentNode) {
        oldCanvas.parentNode.removeChild(oldCanvas);
      }
    }

    this.renderer = new this.THREE.WebGLRenderer(this.getRendererConfig());
    this.configureRenderer();

    const el = this.containerRef.nativeElement;
    el.appendChild(this.renderer.domElement);

    this.setupWebGLContextHandlers();
    this.onResize();

    if (this.modelGroup) {
      while (this.modelGroup.children.length > 0) {
        this.modelGroup.remove(this.modelGroup.children[0]);
      }
    }

    this.loading = true;
    this.showFallback = false;
    this.loadModel();

    if (this.isPageVisible) {
      this.animate();
    }
  }

  private getRendererConfig(): any {
    const isMobile = window.innerWidth < 768;
    const effectiveQuality = isMobile ? 'balanced' : this.mobileQuality;
    const antialias = isMobile ? effectiveQuality === 'high' : true;
    return {
      antialias,
      alpha: true,
      powerPreference: 'high-performance' as const,
      failIfMajorPerformanceCaveat: false,
    };
  }

  private configureRenderer() {
    this.renderer.outputColorSpace = this.THREE.SRGBColorSpace;
    this.renderer.toneMapping = this.THREE.ACESFilmicToneMapping;

    const isMobile = window.innerWidth < 768;
    const effectiveQuality = isMobile ? 'balanced' : this.mobileQuality;
    let maxPixelRatio = 1.5;
    this.targetFPS = 60;
    if (isMobile) {
      if (effectiveQuality === 'low') {
        maxPixelRatio = 0.75;
        this.targetFPS = 24;
      } else if (effectiveQuality === 'balanced') {
        maxPixelRatio = Math.min(window.devicePixelRatio, 1.0);
        this.targetFPS = 30;
      } else {
        maxPixelRatio = Math.min(window.devicePixelRatio, 1.5);
        this.targetFPS = 60;
      }
    }
    this.frameInterval = 1000 / this.targetFPS;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    this.renderer.shadowMap.enabled = false;
  }

  private addCanvasToDOM() {
    const el = this.containerRef.nativeElement;
    el.appendChild(this.renderer.domElement);
  }

  private setupLighting() {
    const lights = this.createLights();
    lights.forEach((light) => this.scene.add(light));
  }

  private createLights() {
    return [
      new this.THREE.AmbientLight(0xffffff, 6.2),
      this.createDirectionalLight(0xffffff, 2.5, [5, 5, 5]),
      this.createDirectionalLight(0xffffff, 2.0, [-4, 2, 3]),
      this.createDirectionalLight(0xffffff, 10.8, [0, 8, 0]),
    ];
  }

  private createDirectionalLight(color: number, intensity: number, position: number[]) {
    const light = new this.THREE.DirectionalLight(color, intensity);
    light.position.set(position[0], position[1], position[2]);
    return light;
  }

  private setupModelGroup() {
    this.modelGroup = new this.THREE.Group();
    this.scene.add(this.modelGroup);
    this.scene.environment = null;
  }

  private isWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  private loadModel() {
    this.setupLoaders();
    this.loadModelData();
  }

  private setupLoaders() {
    this.gltfLoader = new this.GLTFLoader();
    this.gltfLoader.setMeshoptDecoder(this.MeshoptDecoder);

    this.draco = new this.DRACOLoader();
    this.draco.setDecoderPath('/assets/draco/');
    this.gltfLoader.setDRACOLoader(this.draco);

    this.ktx2 = new this.KTX2Loader();
    this.ktx2.setTranscoderPath('/assets/basis/');
    this.ktx2.detectSupport(this.renderer);
    this.gltfLoader.setKTX2Loader(this.ktx2);
  }

  private loadModelData() {
    this.gltfLoader!.load(
      this.modelUrl,
      (gltf: any) => this.handleModelLoad(gltf),
      (e: ProgressEvent) => this.handleModelProgress(e),
      (error: any) => this.handleModelError(error)
    );
  }

  private handleModelLoad(gltf: any) {
    try {
      const obj = gltf.scene;
      this.modelGroup.add(obj);
      this.processModelMaterials(obj);
      this.fitModelToView(obj);
      this.animateModel();
      this.loading = false;
      console.log('Model loaded successfully:', this.modelUrl);
    } catch (error) {
      console.error('Error processing loaded model:', error);
      this.showFallback = true;
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private processModelMaterials(obj: any) {
    const isMobile = window.innerWidth < 768;
    const effectiveQuality = isMobile ? 'balanced' : this.mobileQuality;

    obj.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const m = child.material;
        this.updateMaterialColorSpaces(m);

        if (isMobile && m.map) {
          m.map.generateMipmaps = true;
          if (effectiveQuality === 'low') {
            m.map.minFilter = this.THREE.LinearMipmapLinearFilter;
            m.map.magFilter = this.THREE.LinearFilter;
          } else if (effectiveQuality === 'balanced') {
            m.map.minFilter = this.THREE.LinearMipmapLinearFilter;
            m.map.magFilter = this.THREE.LinearFilter;
            m.map.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
          } else {
            m.map.minFilter = this.THREE.LinearMipmapLinearFilter;
            m.map.magFilter = this.THREE.LinearFilter;
            m.map.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
          }
        }

        m.needsUpdate = true;
      }
    });
  }

  private updateMaterialColorSpaces(material: any) {
    const colorSpaceProps = ['map', 'emissiveMap', 'roughnessMap', 'metalnessMap'];
    colorSpaceProps.forEach((prop) => {
      if (material[prop]) {
        material[prop].colorSpace = this.THREE.SRGBColorSpace;
      }
    });
  }

  private fitModelToView(obj: any) {
    const box = new this.THREE.Box3().setFromObject(obj);
    const size = new this.THREE.Vector3();
    box.getSize(size);
    const center = new this.THREE.Vector3();
    box.getCenter(center);
    obj.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.5 / maxDim;
    obj.scale.setScalar(scale);

    this.camera.position.z = this.calculateOptimalZ(size, scale);
  }

  private calculateOptimalZ(size: any, scale: number): number {
    const desiredScale = 1.2;
    const fovRad = (this.fov * Math.PI) / 180;
    const fitHeightDistance = (size.y * scale * desiredScale) / (2 * Math.tan(fovRad / 2));
    return Math.min(this.maxZoom, Math.max(this.minZoom, fitHeightDistance));
  }

  private animateModel() {
    this.containerRef.nativeElement.style.opacity = '0';
    this.modelGroup.scale.set(0.01, 0.01, 0.01);

    gsap.to(this.modelGroup.scale, {
      x: 1.2, y: 1.2, z: 1.2,
      duration: 1,
      ease: 'power2.out',
    });

    gsap.to(this.modelGroup.rotation, {
      y: (70 * Math.PI) / 180,
      z: (-5 * Math.PI) / 180,
      duration: 2,
      ease: 'power2.out',
    });

    gsap.to(this.containerRef.nativeElement, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    });
  }

  private handleModelProgress(e: ProgressEvent) {
    this.loading = true;
    if (e.total > 0) {
      const progress = (e.loaded / e.total) * 100;
      console.log(`Model loading progress: ${progress.toFixed(1)}%`);
    }
  }

  private handleModelError(error: any) {
    console.error('Failed to load 3D model:', error);
    this.showFallback = true;
    this.loading = false;
    this.cdr.detectChanges();
  }

  private addEvents() {
    this.boundResizeHandler = () => this.onResize();
    this.boundPointerMoveHandler = (e) => this.onPointerMove(e);
    this.boundPointerDownHandler = (e) => this.onPointerDown(e);
    this.boundPointerUpHandler = (e) => this.onPointerUp(e);
    this.boundWheelHandler = (e) => this.onWheel(e);
    this.boundVisibilityChangeHandler = () => this.onVisibilityChange();

    window.addEventListener('resize', this.boundResizeHandler);
    document.addEventListener('visibilitychange', this.boundVisibilityChangeHandler);
    const el = this.containerRef.nativeElement;
    el.addEventListener('pointermove', this.boundPointerMoveHandler);
    el.addEventListener('pointerdown', this.boundPointerDownHandler);
    el.addEventListener('pointerup', this.boundPointerUpHandler);
    el.addEventListener('wheel', this.boundWheelHandler, { passive: true });

    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      this.isElementVisible = true;
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isElementVisible = entry.isIntersecting && entry.intersectionRatio > 0;

          if (!this.isElementVisible && this.isAnimating) {
            if (this.frameId !== null) {
              cancelAnimationFrame(this.frameId);
              this.frameId = null;
            }
            this.isAnimating = false;
          } else if (
            this.isElementVisible &&
            !this.isAnimating &&
            !this.glContextLost &&
            this.isPageVisible
          ) {
            this.animate();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    this.intersectionObserver.observe(this.containerRef.nativeElement);
  }

  private onVisibilityChange() {
    this.isPageVisible = !document.hidden;

    if (!this.isPageVisible) {
      if (this.frameId !== null) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
      this.isAnimating = false;
    } else if (!this.isAnimating && !this.glContextLost && this.isElementVisible) {
      this.animate();
    }
  }

  private onPointerDown(e: PointerEvent) {
    this.isDragging = true;
    this.isAutoRotating = false;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    const el = this.containerRef.nativeElement;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
  }

  private onPointerUp(e: PointerEvent) {
    this.isDragging = false;
    setTimeout(() => {
      this.isAutoRotating = true;
    }, 100);
    const el = this.containerRef.nativeElement;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = 'grab';
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging || !this.modelGroup) return;

    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;

    this.lastX = e.clientX;
    this.lastY = e.clientY;

    const rotationSpeed = 0.005;
    this.modelGroup.rotation.y += dx * rotationSpeed;
    this.modelGroup.rotation.x += dy * rotationSpeed;
  }

  private onWheel(e: WheelEvent) {
    if (!this.enableZoom || !this.camera) return;
    
    // Prevent default scrolling behavior when zooming the model
    e.preventDefault();

    const zoomSpeed = 0.001;
    const newZ = this.camera.position.z + e.deltaY * zoomSpeed;
    this.camera.position.z = Math.max(this.minZoom, Math.min(this.maxZoom, newZ));
  }

  private onResize() {
    if (!this.camera || !this.renderer || !this.containerRef) return;

    const el = this.containerRef.nativeElement;
    const width = el.clientWidth;
    const height = el.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private animate() {
    if (!this.isPageVisible || !this.isElementVisible || this.glContextLost) {
      this.isAnimating = false;
      return;
    }

    this.isAnimating = true;

    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed > this.frameInterval) {
      this.lastFrameTime = now - (elapsed % this.frameInterval);

      if (this.isAutoRotating && this.modelGroup && !this.isDragging) {
        this.modelGroup.rotation.y += 0.005;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    this.frameId = requestAnimationFrame(() => this.animate());
  }
}
