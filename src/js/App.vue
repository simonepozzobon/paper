<template lang="html">
    <div id="app">
    </div>
</template>

<script>
import THREE from './three/setup'
import noise from './three/perlin'
import Tone from 'tone'
import dat from 'dat.gui'
import {
    App,
    AmbientLight,
    DefineModule,
    ElementModule,
    FogModule,
    Icosahedron,
    Importer,
    Loop,
    MeshComponent,
    OrbitControlsModule,
    PerspectiveCamera,
    Plane,
    PointLight,
    RenderingModule,
    ResizeModule,
    SceneModule,
    Sphere
} from 'whs'

import * as PHYSICS from 'physics-module-ammonext'

export default {
    name: 'App',
    data: function() {
        return {
            gui: new dat.GUI(),
            camera: null,
            colors: {
                black: 0x34363B,
                gray: 0xA9B0C3,
                lighGrey: 0xDEE7FF,
                white: 0xFFFFFF,
                green: 0x58FF8B,
                red: 0xFF6E57,
                yellow: 0xFFE25F,
                blue: 0x61C3FF,

            },
            controls: null,
            clock: new THREE.Clock(),
            fog: new THREE.FogExp2(0xf3f3f3, 0.003),
            scene: new THREE.Scene(),
            particles: null,
            particlesInitials: null,
            particlesGeometry: null,
            particlesMaterial: null,
            particlestexture: null,
            renderer: new THREE.WebGLRenderer({
                antialias: true,
            }),
            width: 0,
            height: 0,
            options: {},
            spawnerOptions: {},
            tick: 0,
            whs: null
        }
    },
    methods: {
        initWHS: function() {
            var vue = this
            this.width = window.innerWidth
            this.height = window.innerHeight

            var shadowmap = THREE.PCFSoftShadowMap

            const fogModule = new FogModule({color: 0xaaaaaa, near: 10, far: 200, density: 0.002})

            this.whs = new App([
                new ElementModule(),
                new SceneModule(),
                new DefineModule('camera', new PerspectiveCamera({
                    position: {
                        z: 250,
                        y: 50,
                        x: -20
                    },
                    far: 10000,
                    near: 1,
                })),
                new RenderingModule({
                    bgColor: this.colors.white,
                    renderer: {
                        antialias: true,
                        shadowMap: {
                            type: shadowmap
                        }
                    },
                    shadow: true,
                }),
                new PHYSICS.WorldModule({
                    ammo: window.origin + '/js/ammo.js',
                    gravity: new THREE.Vector3(0, -9.8, 0),
                }),
                new OrbitControlsModule(),
                new ResizeModule(),
                fogModule
            ]);


            var sphere = new Sphere({
                geometry: {
                    radius: 5,
                    widthSegments: 32,
                    heightSegments: 32,
                },

                modules: [
                    // new PHYSICS.SphereModule({
                    //     mass: 100,
                    //     pressure: 10000,
                    //     restitution: 1.5
                    // })
                ],

                material: new THREE.MeshLambertMaterial({
                    color: this.colors.red,
                    reflectivity: .2,
                }),

                position: {
                    y: 20
                }
            })
            sphere.native.frustumCulled = false
            sphere.addTo(this.whs)

            var light = new AmbientLight({
                intensity: 1
            }).addTo(this.whs)

            var pointLight = new PointLight({
                intensity: 0.5,
                distance: 100,
                shadow: Object.assign({
                    fov: 90
                }, shadowmap),
                position: [0, 10, 10]
            }).addTo(this.whs)


            //
            // PARTICLES
            //

            class Points extends MeshComponent {
                build(params = {}) {
                    return new THREE.Points(params.geometry, params.material)
                }
            }

            /* Geometry to morph */
            var boxGeometry = new THREE.BoxGeometry(100, 100, 100)

            /* Texture */
            this.particlesTexture = new THREE.TextureLoader().load('/images/sprites/sprite01.png')
            this.particlesTexture.minFilter = THREE.NearestFilter
            this.particlesTexture.magFilter = THREE.NearestFilter

            /* Material */
            this.particlesMaterial = new THREE.PointsMaterial({
                color: this.colors.red,
                size: 5,
                map: this.particlesTexture,
                alphaTest: .25,
                // blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.7,
            })

            /* Geometry */
            this.particlesGeometry = new THREE.Geometry()
            var numVerts = 1000
            var newVerts = THREE.GeometryUtilsCustom.randomPointsInGeometry(boxGeometry, numVerts)
            for (var i = 0; i < newVerts.length; i++) {
                this.particlesGeometry.vertices.push(newVerts[i])
            }

            this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial)

            const particles = new Points({this.particlesGeometry, this.particlesMaterial}).addTo(this.whs)


            const loop = new Loop((clock) => {
                for (var i = 0; i < this.particlesGeometry.vertices.length; i++) {
                }
            }).start(this.whs)

            this.whs.start();
        },
        onMouseMove: function(event) {

        },
        render: function() {
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        },
    },
    mounted() {
        // this.init()
        // this.animate()
        this.initWHS()
    }
}
</script>

<style lang="scss">
</style>
