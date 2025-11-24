import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ClearPass } from "three/addons/postprocessing/ClearPass.js";

// === CONFIG ===
const FOLLOW_SCALE = 0.9;   // how much the blob follows the mouse
const POS_MULT     = 0.35;  // position influence
const ROT_MULT     = 0.45;  // rotation influence
const DEADZONE     = 0.05;  // zone near the center where blob stays still
const LOOK = "chrome";      // "glass" | "metal" | "chrome"

// === INIT ===
const mount = document.getElementById("glass-blob");
if (!mount) {
    console.warn("⚠️ glass-blob element not found — blob.js aborted");
} else {

    // === MATERIAL ===
    function makeMaterial(look) {
        switch (look) {
            case "metal":
                return new THREE.MeshPhysicalMaterial({
                    metalness: 0.95,
                    roughness: 0.15,
                    transmission: 0.0,
                    clearcoat: 0.6,
                    clearcoatRoughness: 0.25,
                    envMapIntensity: 1.6,
                    attenuationColor: new THREE.Color("#62fff1"),
                });
            case "chrome":
                return new THREE.MeshPhysicalMaterial({
                    metalness: 0.85,
                    roughness: 0.08,
                    transmission: 0.55,
                    thickness: 1.8,
                    ior: 1.46,
                    clearcoat: 0.7,
                    clearcoatRoughness: 0.12,
                    attenuationColor: new THREE.Color("#62fff1"),
                    attenuationDistance: 2.0,
                    envMapIntensity: 1.6,
                    iridescence: 0.25,
                    iridescenceIOR: 1.25,
                    iridescenceThicknessRange: [120, 360],
                });
            default: // glass
                return new THREE.MeshPhysicalMaterial({
                    transmission: 1.0,
                    thickness: 1.2,
                    ior: 1.33,
                    roughness: 0.02,
                    metalness: 0.0,
                    clearcoat: 0.8,
                    clearcoatRoughness: 0.08,
                    attenuationColor: new THREE.Color("#00ffe7"),
                    attenuationDistance: 999,
                    envMapIntensity: 1.2,
                    iridescence: 0.18,
                    iridescenceIOR: 1.3,
                    iridescenceThicknessRange: [80, 240],
                });
        }
    }

    // === RENDERER ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.55;
    renderer.setClearColor(0x000000, 0);
    renderer.setClearAlpha(0);
    mount.appendChild(renderer.domElement);

    // === SCENE & CAMERA ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.1, 6.2);
    scene.add(new THREE.HemisphereLight(0xbff7ff, 0x082026, 0.25));

    // === GEOMETRY ===
    const mat = makeMaterial(LOOK);
    const geo = new THREE.SphereGeometry(1.15, 256, 256);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(0.85, 0.85, 0.85);
    scene.add(mesh);

    // === GPU Shader Noise ===
    const uniforms = {
        uTime: { value: 0 },
        uAmp:  { value: 0.6 },
        uFreq: { value: 0.3 }
    };

    mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uniforms.uTime;
        shader.uniforms.uAmp  = uniforms.uAmp;
        shader.uniforms.uFreq = uniforms.uFreq;

        const noise = /* glsl */`
        vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
        vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
        vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){
            const vec2  C = vec2(1.0/6.0, 1.0/3.0);
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute( permute( permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 0.142857142857;
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0+1.0;
            vec4 s1 = floor(b1)*2.0+1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }`;

        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", `#include <common>\n${noise}\nuniform float uTime; uniform float uAmp; uniform float uFreq;`)
            .replace("#include <begin_vertex>", `
            #include <begin_vertex>
            float n = snoise( transformed * uFreq + vec3(uTime*0.3) );
            transformed += normal * (n * uAmp);
        `);
    };
    mat.needsUpdate = true;

    // === HDRI ENV MAP ===
    new RGBELoader().load(
        "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_07_1k.hdr",
        (hdr) => {
            hdr.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = hdr;
        }
    );

    // === LIGHTS ===
    const cursorLight = new THREE.PointLight(0x9ffff0, 2.2, 2.8);
    scene.add(cursorLight);

    // === POST PROCESSING ===
    let composer;
    function setupPost() {
        const size = new THREE.Vector2();
        renderer.getSize(size);
        const rt = new THREE.WebGLRenderTarget(size.x, size.y, {
            format: THREE.RGBAFormat,
            depthBuffer: true,
            stencilBuffer: false,
        });
        composer = new EffectComposer(renderer, rt);
        composer.addPass(new ClearPass(0x000000, 0.0));
        const renderPass = new RenderPass(scene, camera);
        renderPass.clear = false;
        composer.addPass(renderPass);
        const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.22, 0.6, 0.94);
        composer.addPass(bloom);
    }

    // === RESIZE ===
    function resize() {
        const rect = mount.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height || rect.width);
        renderer.setSize(w, h, false);
        renderer.setClearAlpha(0);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (composer) composer.setSize(w, h);
    }
    setupPost();
    resize();
    window.addEventListener("resize", resize);

    // === MOUSE FOLLOW ===
    const pointer = { x:0, y:0, tx:0, ty:0, ease:0.02 };
    function onPointerMove(e) {
        const r = mount.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        let tx = THREE.MathUtils.clamp(nx, -1, 1) * FOLLOW_SCALE;
        let ty = THREE.MathUtils.clamp(ny, -1, 1) * FOLLOW_SCALE;
        if (Math.abs(tx) < DEADZONE) tx = 0;
        if (Math.abs(ty) < DEADZONE) ty = 0;
        pointer.tx = tx;
        pointer.ty = ty;
        cursorLight.position.set(tx*0.9, -ty*0.9, 1.4);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // === ANIMATE ===
    (function animate() {
        requestAnimationFrame(animate);
        const t = performance.now() / 1000;
        uniforms.uTime.value = t;
        pointer.x += (pointer.tx - pointer.x) * pointer.ease;
        pointer.y += (pointer.ty - pointer.y) * pointer.ease;
        mesh.position.x = pointer.x * POS_MULT;
        mesh.position.y = -pointer.y * POS_MULT;
        mesh.rotation.x = pointer.y * ROT_MULT;
        mesh.rotation.y = pointer.x * ROT_MULT;
        renderer.setClearAlpha(0);
        renderer.render(scene, camera);
    })();
}