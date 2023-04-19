import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as d3 from "d3";
import earcut from "earcut";

import ground_fs from "./src/shader/ground/ground.fragement";
import ground_vs from "./src/shader/ground/ground.vertex";

import polygon_fs from "./src/shader/polygon/polygon.fragement";
import polygon_vs from "./src/shader/polygon/polygon.vertex";

const scene = new THREE.Scene();
scene.background = null;


// vec3 K_QuinacridoneRose = vec3(0.22, 1.47, 0.57);
// vec3 S_QuinacridoneRose = vec3(0.05, 0.003, 0.03);
// vec3 K_FrenchUltramarine = vec3(0.86, 0.86, 0.06);
// vec3 S_FrenchUltramarine = vec3(0.005, 0.005, 0.09);
// vec3 K_CeruleanBlue = vec3(1.52, 0.32, 0.25);
// vec3 S_CeruleanBlue = vec3(0.06, 0.26, 0.40);
// vec3 K_HookersGreen = vec3(1.62, 0.61, 1.64);
// vec3 S_HookersGreen = vec3(0.01, 0.012, 0.003);
// vec3 K_HansaYellow = vec3(0.06, 0.21, 1.78);
// vec3 S_HansaYellow = vec3(0.50, 0.88, 0.009);

const K_Color = [
    [0.22, 1.47, 0.57], // 玫瑰红
    [0.86, 0.86, 0.06], // 法国群青
    [1.52, 0.32, 0.25], // 蔚蓝
    [1.62, 0.61, 1.64], // 绿色
    [0.06, 0.21, 1.78], // 汉莎黄
    [0.14, 1.08, 1.68], // 火赤
    [0.46, 1.07, 1.50], // 印度红
    // [0.08, 0.11, 0.07], // 丁香白
];

const S_Color = [
    [0.05, 0.003, 0.03],
    [0.005, 0.005, 0.09],
    [0.06, 0.26, 0.40], 
    [0.01, 0.012, 0.003], 
    [0.50, 0.88, 0.009],
    [0.77, 0.015, 0.018],
    [1.28, 0.38, 0.21],
    // [1.25, 0.42, 1.43], 
]

const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10000);
camera.position.x = 0;
camera.position.y =  0; camera.position.z = 256;

const control = new OrbitControls(camera, renderer.domElement);
// control.maxAzimuthAngle = 0;
// control.minAzimuthAngle = (-85 * Math.PI) / 100;
control.minDistance = 1.5;
control.maxDistance = 250;
control.enableRotate = false;
control.mouseButtons = {
    LEFT:THREE.MOUSE.PAN,
    MIDDLE:THREE.MOUSE.DOLLY,
    RIGHT:THREE.MOUSE.ROTATE
}

// 墨卡托投影转换
const projection = d3.geoMercator().center([104.0, 37.5]).scale(80).translate([0, 0]);


function setPlayGround(viewScene:THREE.Scene) {
    // const groundMaterial = new THREE.MeshStandardMaterial( { 
    //     color: 0x031837, 
    //     metalness: 0,
    //     roughness: 1, 
    //     // opacity: 0.2,
    //     opacity: 0.5,
    //     transparent: true,
    // } );
    const textureLoader = new THREE.TextureLoader();
    const uniforms = {
        texture1: {value: textureLoader.load('./src/texture/noise1.png')}
    }

    const groundMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader:ground_vs,
        fragmentShader:ground_fs,
        side:THREE.DoubleSide
    })

    const groundGeometry = new THREE.PlaneGeometry( 2000, 2000, 1, 1 );
    const ground = new THREE.Mesh( groundGeometry, groundMaterial );

    ground.position.z = 0
    // // ground.castShadow = true;
    // ground.receiveShadow = true;

    viewScene.add( ground );
}

async function loadMapData(filepath:string){
    let jsonData;

    await fetch(filepath).then((response) => response.json())
    .then((json) => {jsonData = json});

    return jsonData;
}

function polygon2Mesh(polygonJson:any){
    if(!polygonJson) return;

    console.log(polygonJson);

    polygonJson.features.forEach((elem:any,index:number) => {
        const feature = new THREE.Object3D();
        // 每个的 坐标 数组
        const coordinates = elem.geometry.coordinates;

        console.log(elem.properties);
        // const earcutObject = earcut.flatten(coordinates);
        // const traingles = earcut(earcutObject.vertices,earcutObject.holes,2);

        // const geometry = new THREE.BufferGeometry();
        // const falte = earcutObject.vertices.flat(Infinity);
        // // geometry.attributes.position = new THREE.BufferAttribute(falte,2);
        // geometry.setAttribute('position', new THREE.Float32BufferAttribute(falte, 2));
        // geometry.index = new THREE.Float32BufferAttribute(traingles,1);
        // const material1 = new THREE.MeshStandardMaterial( {
        // // clearcoat: 3.0,
        //     metalness: 1,
        //     roughness: 1,
        //     color: "#0465BD"});

        // feature.add(new THREE.Mesh(geometry,material1));
        coordinates.forEach((mutipolygon:any) => {

            mutipolygon.forEach((polygon:any) => {
                const shape = new THREE.Shape();

                let maxX:number = -Infinity;
                let maxY:number = -Infinity;
                let minX:number = Infinity;
                let minY:number = Infinity;

                for (let i = 0; i < polygon.length; i++) {
                    let [x,y] = projection(polygon[i]) as [number,number];
                    
                    maxX = Math.max(maxX,x);
                    maxY = Math.max(maxY,-y);
                    minX = Math.min(minX,x);
                    minY = Math.min(minY,-y);
                    
                    if (i === 0) {
                        shape.moveTo(x, -y);
                    }
                    shape.lineTo(x, -y);
                }

                const geometry = new THREE.ShapeGeometry(shape,1);

                console.log("box:", maxX,minX,maxY,minY);



                // const material1 = new THREE.MeshStandardMaterial( {
                //     // clearcoat: 3.0,
                //     metalness: 1,
                //     roughness: 1,
                //     color: "#0465BD",
                    
                // } );
                const colorIndex = index % 7;

                const textureLoader = new THREE.TextureLoader();
                const uniforms = {
                    texture1: {value: textureLoader.load('./src/texture/noise1.png')},
                    KColor: {value: K_Color[colorIndex]},
                    SColor: {value: S_Color[colorIndex]},
                    Box: {value: new THREE.Vector4(maxX,minX,maxY,minY)}
                }
                
                const material1 = new THREE.ShaderMaterial({
                    uniforms: uniforms,
                    vertexShader:polygon_vs,
                    fragmentShader:polygon_fs,
                    depthTest: false // 阻止深度测试，防止被遮挡
                    // side:THREE.DoubleSide
                })
                console.log("p:",geometry.attributes.position);

                const mesh = new THREE.Mesh(geometry,material1)

                feature.add(mesh);
                
            });
        });

        scene.add(feature);
    });

    return 1;

}

async function initialise() {
    setPlayGround(scene);

    const json = await loadMapData("./src/json/china.json");
    polygon2Mesh(json);

    addEventListener('resize', resize);

    document.body.appendChild(renderer.domElement);

    resize();

    update();
}

// resize
function resize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// update
function update() {

    requestAnimationFrame(update);

    renderer.render(scene, camera);
}

initialise();
