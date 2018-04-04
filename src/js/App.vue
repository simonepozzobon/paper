<template lang="html">
    <div id="app">

    </div>
</template>

<script>
import THREE from './three/setup'
import noise from './three/perlin'

var lightShadowMapViewer, light, spheres

export default {
    name: 'App',
    data: () => ({
        amount: {
            spheres: 500,
            trees: 1500,
        },
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
        variations: [],
        variations2: [],
        vectors: [],
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
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
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


            // sfondo del paesaggio

            // var textures = this.getTextureFromAtlasFile('images/test.jpg', 6)
            // // console.log(textures)
            // var materials = []
            //
            // for (var i = 0; i < 6; i++) {
            //     materials.push(new THREE.MeshBasicMaterial({ map: textures[i], wireframe: true }))
            // }
            // var skyGeometry = new THREE.CubeGeometry(1500, 1500, 1500)
            //
            // var skyBox = new THREE.Mesh(skyGeometry, materials)
            // skyBox.geometry.scale(1,1, - 1)
            // // skyBox.position.y = 480
            // this.scene.add(skyBox)

            // var bgGeometry = new THREE.BoxGeometry(2500,500,500)
            // var bgMaterials = [
            //     new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/bg-2.jpg'), side: THREE.DoubleSide}), // Right side
            //     new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/bg-4.jpg'), side: THREE.DoubleSide}), // Left Side
            //     new THREE.MeshBasicMaterial({color: 0xcccccc, side: THREE.DoubleSide}), // Top Side
            //     new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), // Bottom Side
            //     new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/bg-1.jpg'), side: THREE.DoubleSide}), // Front Side
            //     new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/bg-3.jpg'), side: THREE.DoubleSide}), // Back Side
            // ]
            //
            // var bg = new THREE.Mesh(bgGeometry, bgMaterials)
            // bg.position.y = 0
            // this.scene.add(bg)

            // var bg = new THREE.Mesh(bgGeometry, bgMaterial)
            // this.scene.add(bg)

            // Piano bianco su cui poggia tutto
            var geometryPlane = new THREE.PlaneBufferGeometry(10000, 10000)
            var materialPlane = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide
            })
            materialPlane.color.setHSL(.75, .5, 1)

            var plane = new THREE.Mesh(geometryPlane, materialPlane)
            plane.rotation.x = -90 * Math.PI / 180
            plane.position.y = -10
            plane.receiveShadow = true
            this.scene.add(plane)


            // Alberelli
            var treeGeometry = new THREE.CylinderGeometry(0, 5, 15, 3, 1)
            var treeMaterial = new THREE.MeshPhongMaterial({
                color: 0x4a4a4a, // colore
                flatShading: true,
                side: THREE.DoubleSide
            })


            // Sfere
            spheres = new THREE.Group()
            this.scene.add(spheres)

            var sphereMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                flatShading: false,
                // transparent: true,
                // opacity: 0.2,
            })

            for (var i = 0; i < this.amount.trees; i++) {
                var triangle = new THREE.Mesh(treeGeometry, treeMaterial)
                triangle.position.x = Math.random() * 2000 - 1000
                triangle.position.y = 0
                triangle.position.z = Math.random() * 2000 - 1000
                triangle.updateMatrix()
                triangle.matrixAutoUpdate = false
                this.scene.add(triangle)
                this.triangles.push(triangle)
            }

            for (var i = 0; i < this.amount.spheres; i++) {
                var delta = Math.sin(i * Math.random())
                var geometrySphere = new THREE.SphereBufferGeometry(1, 20, 20, 10, Math.PI * 2)
                var sphere = new THREE.Mesh(geometrySphere, sphereMaterial)

                var deltaX = Math.random() * 2000 - 1000
                var deltaY = Math.random() * 50 + 20
                var deltaZ = Math.random() * 2000 - 1000

                var vector = new THREE.Vector3(deltaX, deltaY, deltaZ)
                sphere.position.copy(vector)
                this.vectors.push(vector)

                var variation = Math.random() * 20 + 10
                this.variations.push(variation)

                this.variations2.push(Math.random())

                sphere.scale.x = sphere.scale.y = sphere.scale.z = delta * 2
                sphere.updateMatrix()
                spheres.add(sphere)
                this.spheres.push(sphere)
            }


            // Illuminazione
            var dirLight = new THREE.DirectionalLight(0xffffff, 1)
            dirLight.color.setHSL(0.1, 1, 0.95)
            dirLight.position.set(5, 10, 50)
            dirLight.position.multiplyScalar(30)
            this.scene.add(dirLight)

            dirLight.castShadow = true
            dirLight.shadow.mapSize.width = this.size.width
            dirLight.shadow.mapSize.height = this.size.height

            var d = 5
            dirLight.shadow.camera.left = -d
            dirLight.shadow.camera.right = d
            dirLight.shadow.camera.top = d
            dirLight.shadow.camera.bottom = -d

            dirLight.shadow.camera.near = 10
            dirLight.shadow.camera.far = 500
            dirLight.shadow.bias = -0.0001

            var dirLightHelper = new THREE.DirectionalLightHelper(dirLight)

            var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9)
            hemiLight.color.setHSL(0, 0, 0)

            hemiLight.groundColor.setHSL(0, 0, 1)
            hemiLight.position.set(0, 100, 0)
            this.scene.add(hemiLight)

            var hemitLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10)
            this.scene.add(hemitLightHelper)

            window.addEventListener('resize', this.onWindowResize, false);

        },
        animate: function() {
            var vue = this
            requestAnimationFrame(vue.animate)

            var r = Date.now() * 0.0005;

            for (var i = 0; i < this.amount.spheres; i++) {
                var sphera = this.spheres[i]
                var delta = Math.sin(r * this.variations2[i]) * 10 + this.variations[i]

                this.vectors[i].y = delta
                sphera.position.copy(this.vectors[i])
                // sphera.position.y = sphera.position.y + (delta) * Math.random()
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
        getTextureFromAtlasFile: function(atlasImgUrl, tilesNum) {
            var textures = []
            for (var i = 0; i < tilesNum; i++) {
                textures[i] = new THREE.Texture()
            }

            var imageObj = new Image()
            imageObj.onload = function() {
                var canvas, context
                var tileWidth = imageObj.height

                for (var i = 0; i < textures.length; i++) {
                    canvas = document.createElement('canvas')
                    context = canvas.getContext('2d')
                    canvas.height = tileWidth
                    canvas.width = tileWidth
                    context.drawImage(imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth)
                    textures[i].image = canvas
                    textures[i].needsUpdate = true
                }
            }

            imageObj.src = atlasImgUrl
            return textures
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
