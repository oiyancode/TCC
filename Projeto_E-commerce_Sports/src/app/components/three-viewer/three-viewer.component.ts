import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
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
  private draco?: any;
  private ktx2?: any;

  ngAfterViewInit() {
    try {
      this.initThree();
      this.loadModel();
      this.addEvents();
      this.onResize();
      this.animate();
    } catch (error) {
      console.error('Three.js initialization failed:', error);
      this.showFallback = true;
      this.loading = false;
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
    const el = this.containerRef?.nativeElement;
    el?.removeEventListener('pointermove', this.onPointerMove);
    el?.removeEventListener('pointerdown', this.onPointerDown);
    el?.removeEventListener('pointerup', this.onPointerUp);
    el?.removeEventListener('wheel', this.onWheel);
    
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    // Proper Three.js cleanup
    if (this.scene) {
      // Dispose all meshes in the scene
      this.scene.traverse((child) => {
        // Check if it's a Mesh (has geometry and material)
        if ((child as any).geometry && (child as any).material) {
          const mesh = child as any;
          // Dispose geometry
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          // Dispose materials
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material: any) => {
              // Dispose texture maps
              if (material.map) material.map.dispose();
              if (material.normalMap) material.normalMap.dispose();
              if (material.roughnessMap) material.roughnessMap.dispose();
              if (material.metalnessMap) material.metalnessMap.dispose();
              if (material.emissiveMap) material.emissiveMap.dispose();
              if (material.alphaMap) material.alphaMap.dispose();
              material.dispose();
            });
          } else {
            const material = mesh.material;
            // Dispose texture maps
            if (material.map) material.map.dispose();
            if (material.normalMap) material.normalMap.dispose();
            if (material.roughnessMap) material.roughnessMap.dispose();
            if (material.metalnessMap) material.metalnessMap.dispose();
            if (material.emissiveMap) material.emissiveMap.dispose();
            if (material.alphaMap) material.alphaMap.dispose();
            material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    this.draco?.dispose();
    this.ktx2?.dispose();

    // Clear references
    this.scene = null as any;
    this.camera = null as any;
    this.renderer = null as any;
    this.modelGroup = null as any;
  }

  private initThree() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(this.fov, 1, 0.01, 100);
    this.camera.position.set(0, 0, 4.5);
    this.renderer = new WebGLRenderer({
      antialias: false, // Disabled antialias for better performance
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduced pixel ratio
    this.renderer.shadowMap.enabled = false; // Disable shadows for better performance
    const el = this.containerRef.nativeElement;
    el.appendChild(this.renderer.domElement);

    // Enhanced lighting setup: ambient boost + top light
    const amb = new AmbientLight(0xffffff, 6.2); // Increased ambient light
    const dir1 = new DirectionalLight(0xffffff, 2.5);
    dir1.position.set(5, 5, 5);
    const fill = new DirectionalLight(0xffffff, 2.0);
    fill.position.set(-4, 2, 3);
    const top = new DirectionalLight(0xffffff, 10.8); // New top light
    top.position.set(0, 8, 0);
    this.scene.add(amb, dir1, fill, top);

    this.modelGroup = new Group();
    this.scene.add(this.modelGroup);

    // Simplified environment - using a basic color gradient instead of heavy HDRI
    this.scene.environment = null; // Remove heavy HDRI for better performance
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    this.draco = new DRACOLoader();
    this.draco.setDecoderPath('/assets/draco/');
    loader.setDRACOLoader(this.draco);
    this.ktx2 = new KTX2Loader();
    this.ktx2.setTranscoderPath('/assets/basis/');
    this.ktx2.detectSupport(this.renderer);
    loader.setKTX2Loader(this.ktx2);

    loader.load(
      this.modelUrl,
      (gltf: any) => {
        try {
          const obj = gltf.scene;
          this.modelGroup.add(obj);
          obj.traverse((child: any) => {
            if (child.isMesh && child.material) {
              const m = child.material;
              if (m.map) m.map.colorSpace = SRGBColorSpace;
              if (m.emissiveMap) m.emissiveMap.colorSpace = SRGBColorSpace;
              if (m.roughnessMap) m.roughnessMap.colorSpace = SRGBColorSpace;
              if (m.metalnessMap) m.metalnessMap.colorSpace = SRGBColorSpace;
              m.needsUpdate = true;
            }
          });
          const box = new Box3().setFromObject(obj);
          const size = new Vector3();
          box.getSize(size);
          const center = new Vector3();
          box.getCenter(center);
          obj.position.sub(center);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.5 / maxDim;
          obj.scale.setScalar(scale);
          const desiredScale = 1.2;
          const fovRad = (this.fov * Math.PI) / 180;
          const fitHeightDistance =
            (size.y * scale * desiredScale) / (2 * Math.tan(fovRad / 2));
          const targetZ = Math.min(
            this.maxZoom,
            Math.max(this.minZoom, fitHeightDistance)
          );
          this.camera.position.z = targetZ;
          this.modelGroup.scale.set(0.01, 0.01, 0.01);
          this.containerRef.nativeElement.style.opacity = '0';
          gsap.to(this.modelGroup.scale, {
            x: desiredScale,
            y: desiredScale,
            z: desiredScale,
            duration: 1,
            ease: 'power2.out',
          });
          gsap.to(this.modelGroup.rotation, {
            y: (70 * Math.PI) / 180,
            z: (-5 * Math.PI) / 180,
            duration: 1,
            ease: 'power2.out',
          });
          gsap.to(this.containerRef.nativeElement, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
          });
          this.loading = false;
          console.log('Model loaded successfully:', this.modelUrl);
        } catch (error) {
          console.error('Error processing loaded model:', error);
          this.showFallback = true;
          this.loading = false;
        }
      },
      (e: ProgressEvent) => {
        this.loading = true;
        if (e.total > 0) {
          const progress = (e.loaded / e.total) * 100;
          console.log(`Model loading progress: ${progress.toFixed(1)}%`);
        }
      },
      (error: any) => {
        console.error('Failed to load 3D model:', error);
        this.showFallback = true;
        this.loading = false;
      }
    );
  }

  private addEvents() {
    window.addEventListener('resize', this.onResize);
    const el = this.containerRef.nativeElement;
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: true });
  }

  private onPointerDown = (e: PointerEvent) => {
    this.isDragging = true;
    this.isAutoRotating = false;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    const el = this.containerRef.nativeElement;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
  };

  private onPointerUp = (e: PointerEvent) => {
    this.isDragging = false;
    // Resume auto rotation after brief delay for smooth interaction
    setTimeout(() => {
      this.isAutoRotating = true;
    }, 100);
    const el = this.containerRef.nativeElement;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = 'grab';
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDragging || !this.modelGroup) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.modelGroup.rotation.y += dx * 0.005;
    const nextX = this.modelGroup.rotation.x + dy * 0.005;
    this.modelGroup.rotation.x = Math.max(-0.8, Math.min(0.8, nextX));
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.enableZoom) return;
    const dz = Math.sign(e.deltaY) * 0.25;
    const z = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.camera.position.z + dz)
    );
    gsap.to(this.camera.position, { z, duration: 0.2, ease: 'power2.out' });
  };

  private animate = () => {
    this.frameId = requestAnimationFrame(this.animate);

    // Auto rotation when not interacting with model
    if (this.isAutoRotating && this.modelGroup) {
      this.modelGroup.rotation.y += 0.001; // Gentle auto rotation on Y axis
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    const el = this.containerRef.nativeElement;
    const w = el.clientWidth;
    const h = Math.max(1, el.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };
}
