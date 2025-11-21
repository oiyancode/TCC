import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Group, SRGBColorSpace, ACESFilmicToneMapping, Vector3, Box3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

@Component({
  selector: 'app-three-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-viewer.component.html',
  styleUrl: './three-viewer.component.scss'
})
export class ThreeViewerComponent implements AfterViewInit, OnDestroy {
  @Input() modelUrl = '/assets/models/skateboard modelo 3d.glb';
  @Input() fallbackSrc = '/assets/tenis.png';
  @Input() fov = 40;
  @Input() minZoom = 2.5;
  @Input() maxZoom = 7;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private modelGroup!: Group;
  showFallback = false;
  private frameId: number | null = null;
  private targetRot = new Vector3(0, 0, 0);

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
    el?.removeEventListener('wheel', this.onWheel);
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(this.fov, 1, 0.01, 100);
    this.camera.position.set(0, 0, 4.5);
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const el = this.containerRef.nativeElement;
    el.appendChild(this.renderer.domElement);

    const amb = new AmbientLight(0xffffff, 0.7);
    const dir1 = new DirectionalLight(0xffffff, 1.0);
    dir1.position.set(3, 4, 5);
    const dir2 = new DirectionalLight(0xffffff, 0.6);
    dir2.position.set(-2, 3, -4);
    this.scene.add(amb, dir1, dir2);

    this.modelGroup = new Group();
    this.scene.add(this.modelGroup);
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      this.modelUrl,
      (gltf) => {
        const obj = gltf.scene;
        this.modelGroup.add(obj);
        const box = new Box3().setFromObject(obj);
        const size = new Vector3();
        box.getSize(size);
        const center = new Vector3();
        box.getCenter(center);
        obj.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim;
        obj.scale.setScalar(scale);
        this.modelGroup.scale.set(0.01, 0.01, 0.01);
        this.containerRef.nativeElement.style.opacity = '0';
        gsap.to(this.modelGroup.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'power2.out' });
        gsap.to(this.containerRef.nativeElement, { opacity: 1, duration: 1, ease: 'power2.out' });
      },
      undefined,
      () => {
        this.showFallback = true;
      }
    );
  }

  private addEvents() {
    window.addEventListener('resize', this.onResize);
    const el = this.containerRef.nativeElement;
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('wheel', this.onWheel, { passive: true });
  }

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width * 2 - 1;
    const ny = (e.clientY - rect.top) / rect.height * 2 - 1;
    this.targetRot.set(ny * 0.25, nx * 0.4, 0);
  };

  private onWheel = (e: WheelEvent) => {
    const dz = Math.sign(e.deltaY) * 0.25;
    const z = Math.min(this.maxZoom, Math.max(this.minZoom, this.camera.position.z + dz));
    gsap.to(this.camera.position, { z, duration: 0.2, ease: 'power2.out' });
  };

  private animate = () => {
    this.frameId = requestAnimationFrame(this.animate);
    if (this.modelGroup) {
      this.modelGroup.rotation.x += (this.targetRot.x - this.modelGroup.rotation.x) * 0.08;
      this.modelGroup.rotation.y += (this.targetRot.y - this.modelGroup.rotation.y) * 0.08;
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

