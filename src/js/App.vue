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
var lightShadowMapViewer, light, spheres

export default {
    name: 'App',
    data: () => ({
        amount: {
            spheres: 500,
            trees: 1500,
        },
        camera: null,
        composer: null,
        composerScene: null,
        controls: null,
        film: null,
        geometry: null,
        glitch: null,
        gui: null,
        material: null,
        mesh: null,
        plane: null,
        renderer: null,
        renderScene: null,
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
            this.scene.background = new THREE.Color(0x252525)
            this.scene.fog = new THREE.FogExp2(0x252525, 0.0015, 1000)




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

            // Piano bianco su cui poggia tutto
            var segments = 128
            var height = 30
            var geometryPlane = new THREE.PlaneGeometry(2500, 2500, segments, segments)
            geometryPlane.computeFaceNormals()
            geometryPlane.computeVertexNormals()

            var materialPlane = new THREE.MeshPhongMaterial({
                color: 0x000000,
                side: THREE.DoubleSide,
                vertexColors: THREE.FaceColors,
                flatShading: true,
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
                vertexColors: THREE.FaceColors,
            })

            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
            cube.position.set(0, 65, 40)
            cube.castShadow = true
            cube.receiveShadow = true
            this.scene.add(cube)


            // Illuminazione

            var lightLeft = new THREE.SpotLight(0xffffff, 1.1);
            lightLeft.castShadow = true;
            // lightLeft.shadowCameraVisible = true;

            lightLeft.shadow.camera.left = -50; // --------- added
            lightLeft.shadow.camera.right = 50;
            lightLeft.shadow.camera.top = 50;
            lightLeft.shadow.camera.bottom = -50;
            lightLeft.shadow.camera.near = 10;
            lightLeft.shadow.camera.far = 400;
            lightLeft.position.set(-300, 500, -70);

            this.scene.add(lightLeft);

            var lightRight = new THREE.SpotLight(0xffffff, 1.1);
            lightRight.castShadow = true;
            // lightRight.shadowCameraVisible = true;

            lightRight.shadow.camera.left = -50; // --------- added
            lightRight.shadow.camera.right = 50;
            lightRight.shadow.camera.top = 50;
            lightRight.shadow.camera.bottom = -50;
            lightRight.shadow.camera.near = 10;
            lightRight.shadow.camera.far = 400;
            lightRight.position.set(220, 500, -180);

            this.scene.add(lightRight);

            var gui = new dat.GUI()
            var g4 = gui.addFolder('cube position')
            g4.add(cube.position, 'x', 0, 200)
            g4.add(cube.position, 'y', 0, 200)
            g4.add(cube.position, 'z', 0, 200)
            var g1 = gui.addFolder('lightright')
            g1.add(lightRight.position, 'x', -500, 500)
            g1.add(lightRight.position, 'y', -500, 500)
            g1.add(lightRight.position, 'z', -500, 500)
            var g2 = gui.addFolder('lightLeft')
            g2.add(lightLeft.position, 'x', -500, 500)
            g2.add(lightLeft.position, 'y', -500, 500)
            g2.add(lightLeft.position, 'z', -500, 500)
            var g3 = gui.addFolder('Camera')
            g3.add(this.camera.position, 'x', -500, 500)
            g3.add(this.camera.position, 'y', -500, 500)
            g3.add(this.camera.position, 'z', -500, 500)
            g3.add(this.camera.rotation, 'x', - 1, 1)
            g3.add(this.camera.rotation, 'y', - Math.PI, Math.PI)
            g3.add(this.camera.rotation, 'z', - Math.PI, Math.PI)

            // lightLeft.shadowCameraHelper = new THREE.CameraHelper(lightLeft.shadow.camera); // - added
            // this.scene.add(lightLeft.shadowCameraHelper); // -------- added
            // lightRight.shadowCameraHelper = new THREE.CameraHelper(lightRight.shadow.camera); // - added
            // this.scene.add(lightRight.shadowCameraHelper); // -------- added


            // this.scene.add(new THREE.AxesHelper(300));
            // this.scene.add(new THREE.SpotLightHelper(lightLeft, 2));
            var rtWidth = this.size.width / 2
            var rtHeight = this.size.height / 2
            var rtParameters = {
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter,
					format: THREE.RGBFormat,
					stencilBuffer: true
			}

            //COMPOSER
            this.composer = new THREE.EffectComposer(this.renderer)

            //PASSES
            var mainRender = new THREE.RenderPass(this.scene, this.camera)
            var filmShader = THREE.FilmShader
            this.film = new THREE.ShaderPass(filmShader)

            var g5 = gui.addFolder('filmShader')
            g5.add(this.film.uniforms.nIntensity, 'value', 0, 1)
            g5.add(this.film.uniforms.sCount, 'value', 1024, 8192)
            // g5.add(this.filmShader.tDiffuse.value, 'format', 0, 8192)

            var vignetteShader = THREE.VignetteShader
            var vignette = new THREE.ShaderPass(vignetteShader)
            vignette.uniforms['offset'].value = 1.2
            vignette.uniforms['darkness'].value = 1.2
            this.glitch = new THREE.GlitchPass()

            var hBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader)
            var vBlur = new THREE.ShaderPass(THREE.VerticalBlurShader)
            hBlur.uniforms.h.value = 0.0004
            vBlur.uniforms.v.value = 0.0002

            var g6 = gui.addFolder('H Blur')
            g6.add(hBlur.uniforms.h, 'value', 0, 0.002)

            var g7 = gui.addFolder('V Blur')
            g7.add(vBlur.uniforms.v, 'value', 0, 0.002)


            // var clearMask = new THREE.ClearMaskPass()
            // var renderMask = new THREE.MaskPass(this.scene, this.camera)
            // var renderMaskInverse = new THREE.MaskPass(this.scene, this.camera)
            // renderMaskInverse.inverse = true
            //
            // // LAST RENDER
            // this.composerScene = new THREE.EffectComposer(this.renderer, new THREE.WebGLRenderTarget(rtWidth * 2, rtHeight * 2, rtParameters))
            // this.renderScene = new THREE.TexturePass(this.composerScene.renderTarget2.texture, .2)
            // this.composerScene.addPass(mainRender)
            // this.composerScene.addPass(renderMaskInverse)
            // this.composerScene.addPass(clearMask)


            this.composer.addPass(mainRender)
            // this.composer.addPass(this.renderScene)
            this.composer.addPass(vignette)
            this.composer.addPass(this.film)
            this.composer.addPass(hBlur)
            this.composer.addPass(vBlur)
            // this.composer.addPass(clearMask)

            // this.composer.addPass(effectFilm)
            // this.composer.addPass(sepia)
            // this.composer.addPass(this.glitch)

            this.glitch.uniforms.byp.value = false
            vBlur.renderToScreen = true

            window.addEventListener('resize', this.onWindowResize, false)
            window.addEventListener('mousemove', this.onMouseMove, false)

        },
        animate: function() {
            var vue = this
            requestAnimationFrame(vue.animate)

            // this.glitch.uniforms.amount.value = Math.random()
            // this.glitch.uniforms.angle.value = Math.random()
            // var value = Boolean(Math.round(Math.random()))
            // this.glitch.uniforms.byp.value = value
            var date = Date.now()
            var delta = Math.abs(Math.cos(date) * Math.sin(date)) * 4
            console.log(delta)

            for (var i = 0; i < this.plane.geometry.vertices.length; i++) {
                this.plane.geometry.vertices[i].z = this.plane.geometry.vertices[i].z * delta
            }

            this.film.uniforms.time.value += 0.01
            this.film.uniforms.sIntensity.value = Math.random() / 3
            this.film.uniforms.nIntensity.value = Math.random() / 10

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
            this.camera.rotation.y = Math.sin(x) / 4
            // this.camera.position.y = (new THREE.Material())
            // console.log('x', this.camera.position.x)
            // console.log('y', y)
        },
        render: function() {
            var vue = this
            // this.renderer.render(vue.scene, vue.camera)
            this.composer.render()
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
