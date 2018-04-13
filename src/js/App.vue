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
                    return new THREE.Points(params.geom, params.mat)
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
            this.particles.position.set(0, 50, 0)

            var particles = new Points({
                geom: this.particlesGeometry,
                mat: this.particlesMaterial
            }).addTo(this.whs)


            const loop = new Loop((clock) => {
                console.log(clock)
            }).start(this.whs)

            this.whs.start();
        },
        init: function() {
            var vue = this

            //
            // SCENE & SETUP
            //
            this.width = window.innerWidth
            this.height = window.innerHeight

            this.scene.background = new THREE.Color(this.colors.white)
            this.scene.fog = this.fog

            // this.renderer.setClearColor = this.colors.black
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.width, this.height)

            document.body.appendChild(this.renderer.domElement)


            //
            // CAMERA
            //

            this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 10000)
            this.camera.position.set(0, 110, 300)


            //
            // CONTROLS
            //

            this.controls = new THREE.OrbitControls(this.camera)
            this.controls.update()


            //
            // PARTICLES
            //

            /* Geometry to morph */
            var boxGeometry = new THREE.BoxGeometry(100, 100, 100)


            /* Texture */
            this.particlesTexture = new THREE.TextureLoader().load('/images/sprites/sprite02.png')
            this.particlesTexture.minFilter = THREE.NearestFilter
            this.particlesTexture.magFilter = THREE.NearestFilter

            /* Material */
            this.particlesMaterial = new THREE.PointsMaterial({
                color: 0xff0000,
                size: 5,
                map: this.particlesTexture,
                alphaTest: 0.5,
                blending: THREE.AdditiveBlending,
            })

            /* Geometry */
            this.particlesGeometry = new THREE.Geometry()
            var numVerts = 1000
            var newVerts = THREE.GeometryUtilsCustom.randomPointsInGeometry(boxGeometry, numVerts)
            for (var i = 0; i < newVerts.length; i++) {
                this.particlesGeometry.vertices.push(newVerts[i])
            }
            this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial)
            this.particles.position.set(0, 50, 0)
            this.scene.add(this.particles)

            this.particlesInitials = this.particlesGeometry.clone()


            //
            // RENDER
            //

            this.render()


            window.addEventListener('resize', this.onWindowResize, false)
            window.addEventListener('mousemove', this.onMouseMove, false)
        },
        animate: function() {
            var vue = this
            requestAnimationFrame(vue.animate)


            //
            // CLOCK
            //

            var delta = this.clock.getDelta()
            this.tick += delta
            if (this.tick < 0) this.tick = 0


            //
            // ANIMATE PARTICLES
            //
            var g = 9.8
            var m = 2
            var acc = m * g

            var initials = this.particlesInitials.vertices
            var vertices = this.particles.geometry.vertices


            for (var i = 0; i < vertices.length; i++) {
                if (vertices[i].y >= -60) {
                    vertices[i].y = -0.5 * (acc * this.tick * this.tick) + initials[i].y
                }
            }

            this.particles.geometry.verticesNeedUpdate = true


            this.render()
        },
        onWindowResize: function() {
            this.width = window.innerWidth
            this.height = window.innerHeight

            this.scene.fog = this.fog

            this.camera.aspect = this.width / this.height
            this.camera.updateProjectionMatrix()

            this.renderer.setSize(this.width, this.height)
            this.render()
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
