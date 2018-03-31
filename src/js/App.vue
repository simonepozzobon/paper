<template lang="html">
    <div id="app">

    </div>
</template>

<script>
import THREE from './three/setup'

export default {
    name: 'App',
    data: () => ({
        camera: null,
        controls: null,
        geometry: null,
        material: null,
        mesh: null,
        renderer: null,
        scene: null,
    }),
    methods: {
        init: function() {
            var vue = this

            // crea la scena
            this.scene = new THREE.Scene()
            this.scene.background = new THREE.Color(0xcccccc)
            this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002)

            this.renderer = new THREE.WebGLRenderer()
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            document.body.appendChild(vue.renderer.domElement)

            // imposta la camera
            this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
            this.camera.position.set(400,200,0)

            // inserisce i controlli per la camera
            this.controls = new THREE.OrbitControls(vue.camera, vue.renderer.domElement)
            this.controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
			this.controls.dampingFactor = 0.25
			this.controls.panningMode = THREE.HorizontalPanning // default is THREE.ScreenSpacePanning
			this.controls.minDistance = 100
			this.controls.maxDistance = 500
			this.controls.maxPolarAngle = Math.PI / 2


            // Definizione dell'oggetto
            var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 )
			var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } )
			for ( var i = 0; i < 500; i ++ ) {
				var mesh = new THREE.Mesh( geometry, material )
				mesh.position.x = Math.random() * 1600 - 800
				mesh.position.y = 0
				mesh.position.z = Math.random() * 1600 - 800
				mesh.updateMatrix()
				mesh.matrixAutoUpdate = false
				this.scene.add( mesh )
			}

            var light = new THREE.DirectionalLight( 0xffffff )
			light.position.set( 1, 1, 1 )
			this.scene.add( light )
			var light = new THREE.DirectionalLight( 0x002288 )
			light.position.set( - 1, - 1, - 1 )
			this.scene.add( light )
			var light = new THREE.AmbientLight( 0x222222 )
			this.scene.add( light )

            window.addEventListener( 'resize', this.onWindowResize, false );

        },
        animate: function() {
            var vue = this
            requestAnimationFrame(vue.animate)

            this.controls.update()

            // this.render()
        },
        onWindowResize: function() {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        },
        render: function() {
            var vue = this
            this.renderer.render(vue.camera, vue.scene)
        }

    },
    mounted() {
        this.init()
        this.animate()
    }
}
</script>

<style lang="scss">

</style>
