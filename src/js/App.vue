<template lang="html">
    <div id="app">

    </div>
</template>

<script>
import THREE from './three/setup'
import noise from './three/perlin'

var lightShadowMapViewer,
    light

export default {
    name: 'App',
    data: () => ({
        amount: 500,
        camera: null,
        controls: null,
        geometry: null,
        material: null,
        mesh: null,
        renderer: null,
        scene: null,
        size: {
            width: 0,
            height: 0,
        },
        spheres: [],
        timer: 0,
        triangles: [],
    }),
    methods: {
        init: function() {
            var vue = this
            // calcolo le dimensioni della finestra
            this.size.width = window.innerWidth
            this.size.height = window.innerHeight

            // crea la scena
            this.scene = new THREE.Scene()
            this.scene.background = new THREE.Color(0xcccccc)
            this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002, 1000)

            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.size.width, this.size.height)
            document.body.appendChild(vue.renderer.domElement)

            // imposta la camera
            this.camera = new THREE.PerspectiveCamera(50, this.size.width / this.size.height, 1, 1000)
            this.camera.position.set(0, 0, 50)

            // inserisce i controlli per la camera
            this.controls = new THREE.OrbitControls(vue.camera, vue.renderer.domElement)
            this.controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
            this.controls.dampingFactor = 0.25
            this.controls.panningMode = THREE.HorizontalPanning // default is THREE.ScreenSpacePanning
            this.controls.minDistance = 100
            this.controls.maxDistance = 500
            this.controls.maxPolarAngle = Math.PI / 2


            // Piano bianco su cui poggia tutto
            var geometryPlane = new THREE.PlaneGeometry(10000, 10000, 1, 1)
            var materialPlane = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide
            })
            var plane = new THREE.Mesh(geometryPlane, materialPlane)
            this.scene.add(plane)
            plane.rotation.x = -90 * Math.PI / 180
            plane.position.y = -10


            // Alberelli
            var treeGeometry = new THREE.CylinderGeometry(0, 5, 15, 3, 1)
            var treeMaterial = new THREE.MeshPhongMaterial({
                color: 0xf3f3f3, // colore
                flatShading: true
            })


            // Sfere
            var sphereMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                flatShading: false,
            })

            for (var i = 0; i < this.amount; i++) {
                var triangle = new THREE.Mesh(treeGeometry, treeMaterial)
                triangle.position.x = Math.random() * 2000 - 1000
                triangle.position.y = 0
                triangle.position.z = Math.random() * 2000 - 1000
                triangle.updateMatrix()
                triangle.matrixAutoUpdate = false
                this.scene.add(triangle)
                this.triangles.push(triangle)

                var delta = Math.sin(i * Math.random())
                var geometrySphere = new THREE.SphereBufferGeometry(2 * delta, 20, 20, 10, Math.PI * 2)
                var sphere = new THREE.Mesh(geometrySphere, sphereMaterial)
                sphere.position.x = Math.random() * 2000 - 1000
                sphere.position.y = Math.random() * 50 + 20
                sphere.position.z = Math.random() * 2000 - 1000
                sphere.updateMatrix()
                // sphere.matrixAutoUpdate = false
                this.scene.add(sphere)
                this.spheres.push(sphere)
            }


            // Illuminazione
            var lightDir1 = new THREE.DirectionalLight(0xffffff)
            lightDir1.position.set(1, 1, 1)
            // this.scene.add(lightDir1)
            var lightDir2 = new THREE.DirectionalLight(0x000000)
            lightDir2.position.set(-1, -1, -1)
            // this.scene.add(lightDir2)

            var lightAmb = new THREE.AmbientLight(0x191919)
            this.scene.add(lightAmb)

            // luce che genera ombre
            light  = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 2)
            light.position.set(50, 1000, 200)
            // light.target.position.set(0, 0, 0)

            // light.castShadow = true

            // light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 1, 500))
            // light.shadow.bias = 0.0001
            //
            // light.shadow.mapSize.width = this.size.width * 2
            // light.shadow.mapSize.height = this.size.height * 2

            this.scene.add(light)

            lightShadowMapViewer = new THREE.SpotLightHelper(light)
            this.scene.add(lightShadowMapViewer)

            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = THREE.PCFShadowMap
            window.addEventListener('resize', this.onWindowResize, false);

        },
        animate: function() {
            var vue = this
            requestAnimationFrame(vue.animate)

            var r = Date.now() * 0.0005;

            for (var i = 0; i < this.amount; i++) {
                var sphere = this.spheres[i]
                var delta = Math.sin(r)
                sphere.position.y = sphere.position.y + (delta / 6) * Math.random()
            }

            this.controls.update()
            this.render()
        },
        onWindowResize: function() {
            this.size.width = window.innerWidth
            this.size.height = window.innerHeight
            this.camera.aspect = this.size.width / this.size.height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(this.size.width, this.size.height)
        },
        render: function() {
            var vue = this
            this.renderer.render(vue.scene, vue.camera)
        },
        createHUD: function() {

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
