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
  PMREMGenerator,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
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
  private pmrem?: PMREMGenerator;
  showFallback = false;
  private frameId: number | null = null;
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  loading = true;
  private draco?: any;
  private ktx2?: any;

  ngAfterViewInit() {
    try {
      this.initThree();
      this.loadModel();
      this.addEvents();
      this.onResize();
      this.animate();
    } catch {
      this.showFallback = true;
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
    const el = this.containerRef?.nativeElement;
    el?.removeEventListener('pointermove', this.onPointerMove);
    el?.removeEventListener('pointerdown', this.onPointerDown);
    el?.removeEventListener('pointerup', this.onPointerUp);
    el?.removeEventListener('wheel', this.onWheel);
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.draco?.dispose();
    this.ktx2?.dispose();
  }

  private initThree() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(this.fov, 1, 0.01, 100);
    this.camera.position.set(0, 0, 4.5);
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const el = this.containerRef.nativeElement;
    el.appendChild(this.renderer.domElement);

    const amb = new AmbientLight(0xffffff, 1.1);
    const dir1 = new DirectionalLight(0xffffff, 1.6);
    dir1.position.set(3, 4, 5);
    const dir2 = new DirectionalLight(0xffffff, 1.0);
    dir2.position.set(-3, 2, -4);
    const dir3 = new DirectionalLight(0xffffff, 0.8);
    dir3.position.set(0, 3, 0);
    this.scene.add(amb, dir1, dir2, dir3);

    this.modelGroup = new Group();
    this.scene.add(this.modelGroup);

    this.pmrem = new PMREMGenerator(this.renderer);
    const exr = new EXRLoader();
    exr.load(
      '/assets/Modelos_3D/Tenis_3d_Hero/assets/hdrs/sunset_ad754599-3992-4ad9-ae7d-859207a02812/sunset_2K_45b507a6-e7cb-49eb-9d11-73e6be05837f.exr',
      (texture: any) => {
        const envMap = this.pmrem!.fromEquirectangular(texture).texture;
        this.scene.environment = envMap;
        texture.dispose();
      }
    );
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
      },
      (e: ProgressEvent) => {
        this.loading = true;
      },
      () => {
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
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    const el = this.containerRef.nativeElement;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
  };

  private onPointerUp = (e: PointerEvent) => {
    this.isDragging = false;
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
