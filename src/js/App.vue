<template lang="html">
    <div id="app">
        <div id="call-to-action">
            <a href="#" class="btn">Visit</a>
        </div>
    </div>
</template>

<script>
import THREE from './three/setup'
import noise from './three/perlin'
import dat from 'dat.gui'
var lightShadowMapViewer, light, spheres,
    clock = new THREE.Clock()

export default {
    name: 'App',
    data: () => ({
        amount: {
            spheres: 500,
            trees: 1500,
        },
        camera: null,
        colors: {
            white: 0xffffff,
            black: 0x191919,
            gray: 0xcccccc,
            yellow: 0xF5A623,
            purple: 0xff00ff,
            red: 0xff0000,
        },
        composer: null,
        composerScene: null,
        controls: null,
        film: null,
        geometry: null,
        glitch: null,
        gui: null,
        material: null,
        mesh: null,
        particles: [],
        particlesInitialized: false,
        particlesCount: 0,
        plane: null,
        renderer: null,
        renderScene: null,
        scene: null,
        size: {
            width: 0,
            height: 0,
        },
        shaders: {
            film: null,
            glitch: null,
            mainRender: null,
            vignette: null,
            hBlur: null,
            vBlur: null,
        },
        spheres: [],
        timer: 0,
        timeScale: 0.001,
        triangles: [],
        variations: [],
        variations2: [],
        vectors: [],
    }),
    methods: {
        init: function() {
            var vue = this
            var gui = new dat.GUI()

            // calcolo le dimensioni della finestra
            this.size.width = window.innerWidth
            this.size.height = window.innerHeight


            // crea la scena
            this.scene = new THREE.Scene()
            this.scene.background = new THREE.Color(this.colors.black)
            this.scene.fog = new THREE.FogExp2(this.colors.black, 0.0015, 1000)


            // renderer setup
            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            })
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.size.width, this.size.height)

            this.renderer.autoClear = false
            this.renderer.gammaInput = true
			this.renderer.gammaOutput = true

            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
            document.body.appendChild(vue.renderer.domElement)


            // imposta la camera
            this.camera = new THREE.PerspectiveCamera(45, this.size.width / this.size.height, 1, 10000)
            this.camera.position.set(0, 110, 300)
            this.camera.far = 350
            this.camera.rotation.x = -0.25

            // this.controls = new THREE.OrbitControls(this.camera)
            // this.controls.update()

            // OGGETTI SULLA SCENA
            var segments = 128
            var height = 30
            var geometryPlane = new THREE.PlaneGeometry(2500, 2500, segments, segments)
            geometryPlane.computeFaceNormals()
            geometryPlane.computeVertexNormals()

            var materialPlane = new THREE.MeshStandardMaterial({
                color: this.colors.black,
                // emissive: this.colors.black,
                side: THREE.FrontSide,
                vertexColors: THREE.FaceColors,
                flatShading: true,
                roughness: 1,
                metalness: 0,
            })

            this.plane = new THREE.Mesh(geometryPlane, materialPlane)
            this.plane.name = 'Terrain'
            this.plane.rotation.x = -90 * Math.PI / 180
            this.plane.castShadow = true
            this.plane.receiveShadow = true
            for (var i = 0; i < this.plane.geometry.vertices.length; i++) {
                this.plane.geometry.vertices[i].z = Math.random() * height
            }

            this.scene.add(this.plane)


            // Oggetto in primo piano
            var cubeGeometry = new THREE.CubeGeometry(50,50,50)
            var cubeMaterial = new THREE.MeshStandardMaterial({
                // color: this.colors.black,
                // emissive: this.colors.black,
                vertexColors: THREE.FaceColors,
                roughness: 1,
                metalness: 0,
                flatShading: true
            })

            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
            cube.position.set(0, 65, 40)
            cube.castShadow = true
            cube.receiveShadow = true
            this.scene.add(cube)

            // var particleSystem = new THREE.GPUParticleSystem({
            //     maxParticles: 25000
            // })
            // this.scene.add(particleSystem)
            this.initLight()


            // ILLUMINAZIONE
            var lightLeft = new THREE.SpotLight(this.colors.white, .1);
            lightLeft.castShadow = true;
            lightLeft.shadow.camera.left = -50; // --------- added
            lightLeft.shadow.camera.right = 50;
            lightLeft.shadow.camera.top = 50;
            lightLeft.shadow.camera.bottom = -50;
            lightLeft.shadow.camera.near = 10;
            lightLeft.shadow.camera.far = 400;
            lightLeft.position.set(-220, 550, -180);
            this.scene.add(lightLeft);

            var lightRight = new THREE.SpotLight(this.colors.white, .08);
            lightRight.castShadow = true;
            lightRight.shadow.camera.left = -50; // --------- added
            lightRight.shadow.camera.right = 50;
            lightRight.shadow.camera.top = 50;
            lightRight.shadow.camera.bottom = -50;
            lightRight.shadow.camera.near = 10;
            lightRight.shadow.camera.far = 400;
            lightRight.position.set(220, 550, -180);
            this.scene.add(lightRight);

            var rectLightLeft = new THREE.RectAreaLight(this.colors.yellow, 50, 2, 30)
            rectLightLeft.position.set(-100, 230, 250)
            rectLightLeft.rotation.x = Math.PI / 8 * 5
            rectLightLeft.rotation.y = Math.PI / 8 * 1
            this.scene.add(rectLightLeft)

            var rectLighRight = new THREE.RectAreaLight(this.colors.yellow, 50, 2, 30)
            rectLighRight.position.set(100, 230, 250)
            rectLighRight.rotation.x = Math.PI / 8 * 5
            rectLighRight.rotation.y = Math.PI / 8 * - 1
            this.scene.add(rectLighRight)


            // DAT GUI
            var guiL = gui.addFolder('neonLeft')
            guiL.add(rectLightLeft, 'intensity', 0, 1000)
            guiL.add(rectLightLeft.position, 'x', -300, 300)
            guiL.add(rectLightLeft.position, 'y', 0, 300)
            guiL.add(rectLightLeft.position, 'z', 0, 300)
            guiL.add(rectLightLeft.rotation, 'x', 0, Math.PI)
            guiL.add(rectLightLeft.rotation, 'y', 0, Math.PI)
            guiL.add(rectLightLeft.rotation, 'z', 0, Math.PI)
            var guiR = gui.addFolder('neonRight')
            guiR.add(rectLighRight, 'intensity', 0, 1000)
            guiR.add(rectLighRight.position, 'x', -300, 300)
            guiR.add(rectLighRight.position, 'y', 0, 300)
            guiR.add(rectLighRight.position, 'z', 0, 300)
            guiR.add(rectLighRight.rotation, 'x', 0, Math.PI)
            guiR.add(rectLighRight.rotation, 'y', 0, Math.PI)
            guiR.add(rectLighRight.rotation, 'z', 0, Math.PI)
            var g4 = gui.addFolder('cube position')
            g4.add(cube.position, 'x', 0, 200)
            g4.add(cube.position, 'y', 0, 200)
            g4.add(cube.position, 'z', 0, 200)
            var g1 = gui.addFolder('lightright')
            g1.add(lightRight, 'intensity', 0, 1).step(0.01)
            g1.add(lightRight.position, 'x', -500, 500)
            g1.add(lightRight.position, 'y', -500, 500)
            g1.add(lightRight.position, 'z', -500, 500)
            g1.add(lightRight, 'visible', true, false )
            var g2 = gui.addFolder('lightLeft')
            g2.add(lightLeft, 'intensity', 0, 1).step(0.01)
            g2.add(lightLeft.position, 'x', -500, 500)
            g2.add(lightLeft.position, 'y', -500, 500)
            g2.add(lightLeft.position, 'z', -500, 500)
            g2.add(lightLeft, 'visible', true, false )
            var g3 = gui.addFolder('Camera')
            g3.add(this.camera.position, 'x', -500, 500)
            g3.add(this.camera.position, 'y', -500, 500)
            g3.add(this.camera.position, 'z', -500, 500)
            g3.add(this.camera.rotation, 'x', - 1, 1)
            g3.add(this.camera.rotation, 'y', - Math.PI, Math.PI)
            g3.add(this.camera.rotation, 'z', - Math.PI, Math.PI)


            // HELPER
            // var rectLighRightHelper = new THREE.RectAreaLightHelper(rectLighRight)
            // var rectLightLeftHelper = new THREE.RectAreaLightHelper(rectLightLeft)
            // lightLeft.shadowCameraHelper = new THREE.CameraHelper(lightLeft.shadow.camera); // - added
            // lightRight.shadowCameraHelper = new THREE.CameraHelper(lightRight.shadow.camera); // - added
            // this.scene.add(lightLeft.shadowCameraHelper); // -------- added
            // this.scene.add(lightRight.shadowCameraHelper); // -------- added
            // this.scene.add(rectLighRightHelper)
            // this.scene.add(rectLightLeftHelper)
            // this.scene.add(new THREE.AxesHelper(300));
            // this.scene.add(new THREE.SpotLightHelper(lightLeft, 2));


            // POST PROCESSING
            this.postProcessing()

            window.addEventListener('resize', this.onWindowResize, false)
            window.addEventListener('mousemove', this.onMouseMove, false)

        },
        initLight: function() {
            for (var i = 0; i < this.particlesCount; i++) {
                this.generateLight()
            }
            this.particlesInitialized = true
        },
        generateLight: function() {
            var size = Math.random() * 3
            var positionX = (Math.random() * 380) - 190
            var positionZ = (Math.random() * 300) - 150
            var velocity = (Math.random() / 10) + 0.1
            var pointLight = new THREE.PointLight(0xF5A623, 0.5, 50, 2)
            pointLight.position.set(positionX, positionY, positionZ)

            var spriteMap = new THREE.TextureLoader().load('/images/sprites/sphere.png')
            var spriteMaterial = new THREE.SpriteMaterial({
                map: spriteMap,
                color: 0xF5A623,
            })
            var sprite = new THREE.Sprite(spriteMaterial)

            if (!this.particlesInitialized) {
                console.log('init')
                var positionY = (Math.random() * 200) + 20
                pointLight.position.set(positionX, positionY, positionZ)
            } else {
                pointLight.position.set(positionX, 200, positionZ)
            }

            sprite.scale.x = size
            sprite.scale.y = size
            sprite.scale.z = size
            // sprite.castShadow = true

            pointLight.add(sprite)
            var obj = {
                pointLight: pointLight,
                velocity: velocity,
            }
            var index = this.particles.push(obj) - 1
            this.scene.add(this.particles[index].pointLight)
        },
        animateSprites: function() {
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].pointLight.position.y -= this.particles[i].velocity
                if (this.particles[i].pointLight.position.y <= 0) {
                    this.scene.remove(this.particles[i].pointLight)
                    this.particles.splice(i, 1)
                    this.generateLight()
                }
            }
        },
        animate: function() {
            var vue = this
            requestAnimationFrame(vue.animate)
            var delta = clock.getDelta() * this.timeScale

            this.animateSprites()
            // this.shaders.glitch.uniforms['amount'].value = Math.random()
            // this.shaders.glitch.uniforms['angle'].value = Math.random()
            // var value = Boolean(Math.round(Math.random()))
            // this.shaders.glitch.uniforms['byp'].value = value
            // // var date = Date.now()
            // // var delta = Math.abs(Math.cos(date) * Math.sin(date)) * 4
            // // console.log(delta)
            // //
            // // for (var i = 0; i < this.plane.geometry.vertices.length; i++) {
            // //     this.plane.geometry.vertices[i].z = this.plane.geometry.vertices[i].z * delta
            // // }
            //
            this.shaders.film.uniforms['time'].value += delta
            this.shaders.film.uniforms['sIntensity'].value = Math.random()
            // this.shaders.film.uniforms.nIntensity.value = Math.random() / 10

            // this.controls.update()
            this.render()
        },
        onWindowResize: function() {
            this.size.width = window.innerWidth
            this.size.height = window.innerHeight

            this.camera.aspect = this.size.width / this.size.height
            this.camera.updateProjectionMatrix()

            this.renderer.setSize(this.size.width, this.size.height)


            this.render()
        },
        onMouseMove: function(event) {
            var x = ((event.clientX / this.size.width) - 0.5) * - 2
            var y = ((event.clientY / this.size.height) - 0.5) * 2
            this.camera.position.x = (Math.sin(x) * 10)
            this.camera.position.y = (Math.sin(y) * 5) + 110
            this.camera.position.z = (Math.cos(x) * Math.cos(y) * 5) + 300
            this.camera.rotation.y = Math.sin(x) / 4 * -1
        },
        render: function() {
            var vue = this
            // this.renderer.render(vue.scene, vue.camera)
            this.composer.render()
        },
        postProcessing: function() {
            //COMPOSER
            this.composer = new THREE.EffectComposer(this.renderer)

            //PASSES
            this.shaders.mainRender = new THREE.RenderPass(this.scene, this.camera)
            this.shaders.film = new THREE.ShaderPass(THREE.FilmShader)
            this.shaders.glitch = new THREE.GlitchPass()
            this.shaders.hBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader)
            this.shaders.vignette = new THREE.ShaderPass(THREE.VignetteShader)
            this.shaders.vBlur = new THREE.ShaderPass(THREE.VerticalBlurShader)


            this.shaders.vignette.uniforms['offset'].value = 1.2
            this.shaders.vignette.uniforms['darkness'].value = 1.2
            this.shaders.hBlur.uniforms['h'].value = 0.0002
            this.shaders.vBlur.uniforms['v'].value = 0.0002


            this.composer.addPass(this.shaders.mainRender)
            this.composer.addPass(this.shaders.vignette)
            this.composer.addPass(this.shaders.film)
            this.composer.addPass(this.shaders.hBlur)
            this.composer.addPass(this.shaders.vBlur)

            this.shaders.film.renderToScreen = true

            // this.shaders.glitch.uniforms['byp'].value = false
            // // this.shaders.vBlur.renderToScreen = true
            // this.shaders.glitch.renderToScreen = true
            // dof.renderToScreen = true

        },
    },
    mounted() {
        this.init()
        this.animate()
    }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Oswald');

$font-color: #252525;
$font-family: 'Oswald', sans-serif;
    #app {
        width: 0;
        height: 0;
        font-family: $font-family;

        > #call-to-action {
            position: absolute;
            left: 50%;
            bottom: 20%;
            transform: translateX(-50%);

            color: $font-color;
            text-transform: uppercase;
            letter-spacing: 5px;
            font-size: 1.25rem;

            > a.btn {
                background-color: #ccc;
                padding: 1rem 2rem;
                border-radius: 3px;
                transition: all .4s;

                &:visited,
                &:active,
                &:link {
                    color: $font-color;
                    text-decoration: none;
                    transition: all .4s;
                }

                &:hover {
                    background-color: #191919;
                    color: #f3f3f3;
                    border: 3px solid #252525;

                    transition: all .4s;
                }
            }
        }
    }
</style>
