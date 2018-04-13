<template lang="html">
    <div id="app">
    </div>
</template>

<script>
import THREE from './three/setup'
import noise from './three/perlin'
import Tone from 'tone'
import dat from 'dat.gui'

export default {
    name: 'App',
    data: function() {
        return {
            gui: new dat.GUI(),
            camera: null,
            colors: {
                white: 0xf3f3f3,
                black: 0x191919
            },
            controls: null,
            clock: new THREE.Clock(),
            scene: new THREE.Scene(),
            particles: null,
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
        }
    },
    methods: {
        init: function() {
            var vue = this

            this.width = window.innerWidth
            this.height = window.innerHeight

            this.scene.background = new THREE.Color(this.colors.white)
            this.renderer.setClearColor = this.colors.black
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
            this.scene.add(this.particles)


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

            var delta = this.clock.getDelta()



            this.render()
        },
        onWindowResize: function() {
            this.width = window.innerWidth
            this.height = window.innerHeight

            this.camera.aspect =this.width / this.height
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
        this.init()
        this.animate()
    }
}
</script>

<style lang="scss">
</style>
