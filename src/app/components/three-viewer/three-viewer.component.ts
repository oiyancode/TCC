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
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Group,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  Vector3,
  Box3,
  Mesh,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import gsap from 'gsap';

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
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private modelGroup!: Group;
  showFallback = false;
  private frameId: number | null = null;
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  loading = true;
  private isAutoRotating = true;
  private draco?: DRACOLoader;
  private ktx2?: KTX2Loader;
  private gltfLoader?: GLTFLoader;
  
  // Store bound event handlers for proper cleanup
  private boundResizeHandler?: () => void;
  private boundPointerMoveHandler?: (e: PointerEvent) => void;
  private boundPointerDownHandler?: (e: PointerEvent) => void;
  private boundPointerUpHandler?: (e: PointerEvent) => void;
  private boundWheelHandler?: (e: WheelEvent) => void;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    setTimeout(() => this.initializeViewer(), 0);
  }

  private initializeViewer() {
    try {
      this.initThree();
      this.loadModel();
      this.addEvents();
      this.onResize();
      this.animate();
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  private handleInitializationError(error: any) {
    console.error('Three.js initialization failed:', error);
    this.showFallback = true;
    this.loading = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Proper cleanup of event listeners
    if (this.boundResizeHandler) {
      window.removeEventListener('resize', this.boundResizeHandler);
      this.boundResizeHandler = undefined;
    }
    
    const el = this.containerRef?.nativeElement;
    if (el) {
      if (this.boundPointerMoveHandler) {
        el.removeEventListener('pointermove', this.boundPointerMoveHandler);
        this.boundPointerMoveHandler = undefined;
      }
      if (this.boundPointerDownHandler) {
        el.removeEventListener('pointerdown', this.boundPointerDownHandler);
        this.boundPointerDownHandler = undefined;
      }
      if (this.boundPointerUpHandler) {
        el.removeEventListener('pointerup', this.boundPointerUpHandler);
        this.boundPointerUpHandler = undefined;
      }
      if (this.boundWheelHandler) {
        el.removeEventListener('wheel', this.boundWheelHandler);
        this.boundWheelHandler = undefined;
      }
    }
     
    // Stop animation loop
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    // Enhanced Three.js cleanup
    this.disposeScene();
    this.disposeRenderer();
    this.disposeLoaders();

    // Clear all references to prevent memory leaks
    this.clearReferences();
  }

  /**
   * Dispose all scene objects and their resources
   */
  private disposeScene() {
    if (!this.scene) return;

    // Traverse and dispose all objects
    this.scene.traverse((object: any) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      // Dispose material(s)
      if (object.material) {
        this.disposeMaterial(object.material);
      }
    });

    // Remove all children from scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  /**
   * Dispose material and all its texture maps
   */
  private disposeMaterial(material: any) {
    if (Array.isArray(material)) {
      material.forEach(mat => this.disposeMaterial(mat));
      return;
    }

    if (!material) return;

    // Dispose all possible texture maps
    const textureProperties = [
      'map', 'normalMap', 'roughnessMap', 'metalnessMap', 
      'emissiveMap', 'alphaMap', 'aoMap', 'displacementMap',
      'specularMap', 'envMap', 'bumpMap'
    ];

    textureProperties.forEach(prop => {
      if (material[prop]) {
        material[prop].dispose?.();
        material[prop] = null;
      }
    });

    material.dispose?.();
  }

  /**
   * Dispose renderer and canvas
   */
  private disposeRenderer() {
    if (this.renderer) {
      // Clear the rendering context
      if (this.renderer.getContext()) {
        const gl = this.renderer.getContext();
        if (gl && gl.getExtension('WEBGL_lose_context')) {
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
      }

      // Dispose renderer
      this.renderer.dispose();

      // Remove canvas from DOM
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }

  /**
   * Dispose all loaders and their decoder resources
   */
  private disposeLoaders() {
    // Dispose DRACO loader
    if (this.draco) {
      this.draco.dispose();
      this.draco = undefined;
    }

    // Dispose KTX2 loader
    if (this.ktx2) {
      this.ktx2.dispose();
      this.ktx2 = undefined;
    }

    // Clear GLTF loader reference (no dispose method needed)
    this.gltfLoader = undefined;
  }

  /**
   * Clear all object references to help garbage collection
   */
  private clearReferences() {
    this.scene = undefined as any;
    this.camera = undefined as any;
    this.renderer = undefined as any;
    this.modelGroup = undefined as any;
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
    this.scene = new Scene();
  }

  private setupCamera() {
    this.camera = new PerspectiveCamera(this.fov, 1, 0.01, 100);
    this.camera.position.set(0, 0, 4.5);
  }

  private setupRenderer() {
    try {
      this.renderer = new WebGLRenderer(this.getRendererConfig());
      this.configureRenderer();
      this.addCanvasToDOM();
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      throw new Error('WebGL renderer creation failed');
    }
  }

  private getRendererConfig(): any {
    return {
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance' as const,
      failIfMajorPerformanceCaveat: false
    };
  }

  private configureRenderer() {
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = false;
  }

  private addCanvasToDOM() {
    const el = this.containerRef.nativeElement;
    el.appendChild(this.renderer.domElement);
  }

  private setupLighting() {
    const lights = this.createLights();
    lights.forEach(light => this.scene.add(light));
  }

  private createLights() {
    return [
      new AmbientLight(0xffffff, 6.2),
      this.createDirectionalLight(0xffffff, 2.5, [5, 5, 5] as [number, number, number]),
      this.createDirectionalLight(0xffffff, 2.0, [-4, 2, 3] as [number, number, number]),
      this.createDirectionalLight(0xffffff, 10.8, [0, 8, 0] as [number, number, number])
    ];
  }

  private createDirectionalLight(color: number, intensity: number, position: [number, number, number]) {
    const light = new DirectionalLight(color, intensity);
    light.position.set(position[0], position[1], position[2]);
    return light;
  }

  private setupModelGroup() {
    this.modelGroup = new Group();
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
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    
    this.draco = new DRACOLoader();
    this.draco.setDecoderPath('/assets/draco/');
    this.gltfLoader.setDRACOLoader(this.draco);
    
    this.ktx2 = new KTX2Loader();
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
    obj.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const m = child.material;
        this.updateMaterialColorSpaces(m);
        m.needsUpdate = true;
      }
    });
  }

  private updateMaterialColorSpaces(material: any) {
    const colorSpaceProps = ['map', 'emissiveMap', 'roughnessMap', 'metalnessMap'];
    colorSpaceProps.forEach(prop => {
      if (material[prop]) {
        material[prop].colorSpace = SRGBColorSpace;
      }
    });
  }

  private fitModelToView(obj: any) {
    const box = new Box3().setFromObject(obj);
    const size = new Vector3();
    box.getSize(size);
    const center = new Vector3();
    box.getCenter(center);
    obj.position.sub(center);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.5 / maxDim;
    obj.scale.setScalar(scale);
    
    this.camera.position.z = this.calculateOptimalZ(size, scale);
  }

  private calculateOptimalZ(size: Vector3, scale: number): number {
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
      duration: 1, ease: 'power2.out'
    });
    
    gsap.to(this.modelGroup.rotation, {
      y: (70 * Math.PI) / 180,
      z: (-5 * Math.PI) / 180,
      duration: 2, ease: 'power2.out'
    });
    
    gsap.to(this.containerRef.nativeElement, {
      opacity: 1, duration: 0.8, ease: 'power2.out'
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
    // Store bound handlers for proper cleanup
    this.boundResizeHandler = () => this.onResize();
    this.boundPointerMoveHandler = (e) => this.onPointerMove(e);
    this.boundPointerDownHandler = (e) => this.onPointerDown(e);
    this.boundPointerUpHandler = (e) => this.onPointerUp(e);
    this.boundWheelHandler = (e) => this.onWheel(e);

    window.addEventListener('resize', this.boundResizeHandler);
    const el = this.containerRef.nativeElement;
    el.addEventListener('pointermove', this.boundPointerMoveHandler);
    el.addEventListener('pointerdown', this.boundPointerDownHandler);
    el.addEventListener('pointerup', this.boundPointerUpHandler);
    el.addEventListener('wheel', this.boundWheelHandler, { passive: true });
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
    // Resume auto rotation after brief delay for smooth interaction
    setTimeout(() => {
      this.isAutoRotating = true;
    }, 100);
    const el = this.containerRef.nativeElement;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = 'grab';
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging || !this.modelGroup) return;

    const el = this.containerRef.nativeElement;
    const rect = el.getBoundingClientRect();

    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;

    this.lastX = e.clientX;
    this.lastY = e.clientY;

    // Normalizar o movimento pelo tamanho do contêiner para uma experiência consistente
    const normalizedDx = dx / rect.width;
    const normalizedDy = dy / rect.height;

    // Fator de sensibilidade (2 * PI significa uma rotação completa de 360 graus ao arrastar pela tela)
    const rotationSpeed = 2 * Math.PI;

    this.modelGroup.rotation.y += normalizedDx * rotationSpeed;

    // Limitar a rotação vertical para evitar que o modelo vire de cabeça para baixo
    const nextX = this.modelGroup.rotation.x + normalizedDy * rotationSpeed;
    this.modelGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, nextX));
  }

  private onWheel(e: WheelEvent) {
    if (!this.enableZoom) return;
    const dz = Math.sign(e.deltaY) * 0.25;
    const z = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.camera.position.z + dz)
    );
    gsap.to(this.camera.position, { z, duration: 0.2, ease: 'power2.out' });
  }

  private animate() {
    this.frameId = requestAnimationFrame(() => this.animate());

    // Auto rotation when not interacting with model
    if (this.isAutoRotating && this.modelGroup) {
      this.modelGroup.rotation.y += 0.001; // Gentle auto rotation on Y axis
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onResize() {
    const el = this.containerRef.nativeElement;
    const w = el.clientWidth;
    const h = Math.max(1, el.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }
}
