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
import Tone from 'tone'
import dat from 'dat.gui'
var lightShadowMapViewer, light, spheres

export default {
    name: 'App',
    data: function() {
        return {
            amount: {
                spheres: 500,
                trees: 1500,
            },

            camera: null,
            clock: new THREE.Clock(),
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
            datGui: false,
            film: null,
            geometry: null,
            glitch: null,
            gui: null,
            helpers: false,
            material: null,
            mesh: null,
            obj: {
                particleSystem: null,
            },
            options: {},
            particles: [],
            particlesInitialized: false,
            particlesCount: 0,
            plane: null,
            postProcessingActive: false,
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
            spawnerOptions: {
                spawnRate: 15000,
                horizontalSpeed: 1.5,
                verticalSpeed: 1.33,
                timeScale: 1,
            },
            spheres: [],
            tick: 0,
            timer: 0,
            timeScale: 1,
            triangles: [],
            variations: [],
            variations2: [],
            vectors: [],
            audio: {
                source: {
                    fat: new Tone.FatOscillator({
                        frequency: 50,
                        type: 'square',
                    }),
                    noise: new Tone.Noise({
                        type: 'white',
                        playbackRate: .2,
                    }),
                    tom: new Tone.MembraneSynth({
                        pitchDecay : 1.2,
                        octaves : 3,
                        oscillator: {
                            type: 'triangle'
                        },
                        envelope: {
                            attack: 0.24,
                            decay: 0.46,
                            sustain: 0.37,
                            release: 1.37,
                            attackCurve: 'exponential'
                        }
                    }),
                },
                env: {
                    droneVCA: new Tone.AmplitudeEnvelope({
                        attack: .1,
                        decay: 2.4,
                        sustain: 1,
                        release: 2.4,
                    }),
                    hatsADSR: new Tone.AmplitudeEnvelope({
                        attack: 0.03,
                        decay: 0.05,
                        sustain: 0.37,
                        release: 0.05,
                    }),
                },
                fx: {
                    autoFilter: null,
                    filter: new Tone.Filter({
                        frequency: 150,
                        type: 'lowpass',
                        rolloff: -24,
                        Q: .1,
                    }),
                    noiseFilter: new Tone.Filter({
                        frequency: 150,
                        type: 'lowpass',
                        rollof: -24,
                        Q: .3,
                    }),
                    combFilter: new Tone.FeedbackCombFilter({
                        delayTime: .2,
                        resonance: .5,
                    }),
                    widener: new Tone.StereoWidener(.7),
                    toMono: new Tone.Mono(),
                    reverb: new Tone.Reverb({
                        decay: 2.5,
                        preDelay: 0.01,
                        wet: 0.2
                    })
                },
                meters: {
                    tom: new Tone.Meter(),
                    hats: new Tone.Meter(),
                }
            },
        }
    },
    methods: {
        audioSetup: function() {
            var fat = this.audio.source.fat
            var noise = this.audio.source.noise
            var tom = this.audio.source.tom
            var env = this.audio.env.droneVCA
            var filter = this.audio.fx.filter
            var noiseFilter = this.audio.fx.noiseFilter
            var combFilter = this.audio.fx.combFilter
            var reverb = this.audio.fx.reverb


            // START and generate Reverb impulse
            reverb.generate().then(function(response) {
                Tone.Transport.bpm.value = 125
                Tone.Transport.start()
            }).catch(errors => {
                console.log(errors)
            })


            // TOM
            var tomFilter = new Tone.Filter({
                frequency: 550,
                Q: 0.7,
            })

            // TOM SUB FREQ
            var tomSub = new Tone.OmniOscillator({
                frequency: 440,
                detune: .5,
                type: 'pwm'
            })

            var tomSubADSR = new Tone.AmplitudeEnvelope({
                attack: 0.03,
                decay: 0.05,
                sustain: 0.37,
                release: 0.05,
            })

            var tomSubFilter = new Tone.Filter({
                frequency: 141,
                rolloff: -96,
                Q: 0.1,
                gain: 0.1,
                type: 'bandpass'
            })


            // HATS
            var hats = new Tone.Noise({
                type: 'white'
            })

            var hatsADSR = this.audio.env.hatsADSR

            // EFX - REVERB ADSR
            var reverbADSR = new Tone.AmplitudeEnvelope({
                attack: 0.03,
                decay: 0.05,
                sustain: 0.37,
                release: 0.05,
            })


            // EFX - CHORUS
            var chorus = new Tone.Chorus({
                frequency: 4,
                delayTime: 36,
                depth: 0.7,
                type: 'triangle',
                spread: 90,
            })


            // EFX - PING PONG DELAY
            var pingPong = new Tone.PingPongDelay('16n', 0.2)
            pingPong.wet.value = .16


            // VOLUME MIXER
            var bassVol = new Tone.Volume(-6)
            var sequenceVol = new Tone.Volume(-9)
            var hatsVol = new Tone.Volume(-28)
            var limiter = new Tone.Limiter(-3)

            fat.start().connect(filter)
            filter.connect(combFilter)
            combFilter.connect(bassVol)

            noise.start().connect(noiseFilter)
            noiseFilter.connect(sequenceVol)

            tom.connect(tomFilter)
            tomFilter.connect(chorus)
            chorus.connect(reverb)
            reverb.connect(reverbADSR)
            reverbADSR.connect(pingPong)
            pingPong.connect(sequenceVol).connect(this.audio.meters.tom)

            tomSub.start().connect(tomSubFilter)
            tomSubFilter.connect(tomSubADSR)
            tomSubADSR.connect(reverb)

            hats.start().connect(hatsADSR)
            hatsADSR.connect(this.audio.meters.hats).connect(hatsVol)

            // bassVol.connect(limiter)
            // sequenceVol.connect(limiter)
            hatsVol.connect(limiter)
            limiter.toMaster()

            var bassSeq = new Tone.Sequence(function(time, note){
                fat.frequency.value = note

            }, ["A1", "B1", "A#2", null, 'A1', 'B1', 'A#2'], "2n")

            var arpSeq = new Tone.Sequence(function(time, note){
                var lower = new Tone.Frequency(note).transpose(-12)

                tomSub.frequency.value = lower
                tom.triggerAttackRelease(note, '8n')

                tomSubADSR.triggerAttackRelease({
                    duration: .5,
                    velocity: 0.7
                })

                reverbADSR.triggerAttackRelease({
                    duration: 1,
                    velocity: 1,
                })
            }, ['A1', 'B2', 'A#3', 'A2'], '8n')

            var hatsSeq = new Tone.Sequence(function(time, note) {
                hatsADSR.triggerAttackRelease(note, '16n')

            }, ['A3'], '16n')

            bassSeq.start()
            arpSeq.start()
            hatsSeq.start()

            fat.sync()
            hats.sync()
            tomSub.sync()

            // GUI
            var gui = new dat.GUI()
            var g1 = gui.addFolder('Sound')
            g1.add(tom, 'pitchDecay', 0, 1).step(0.05)
            g1.add(tom, 'octaves', 0, 12).step(1)
            g1.add(tom.envelope, 'attack', 0, 1).step(0.01)
            g1.add(tom.envelope, 'decay', 0, 5).step(0.01)
            g1.add(tom.envelope, 'sustain', 0, 1).step(0.01)
            g1.add(tom.envelope, 'release', 0, 5).step(0.01)

            var g4 = gui.addFolder('Tom Sub Osc')
            g4.add(tomSubFilter.frequency, 'value', 0, 2000).step(1)
            g4.add(tomSubFilter.Q, 'value', 0, 2).step(0.01)
            g4.add(tomSubFilter.gain, 'value', 0, 1).step(0.01)
            g4.add(tomSubADSR, 'attack', 0, 1).step(0.01)
            g4.add(tomSubADSR, 'decay', 0, 1).step(0.01)
            g4.add(tomSubADSR, 'sustain', 0, 1).step(0.01)
            g4.add(tomSubADSR, 'release', 0, 1).step(0.01)

            var g5 = gui.addFolder('Hats')
            g5.add(hatsVol.volume, 'value', -64, 0).step(1)
            g5.add(hatsADSR, 'attack', 0, 1).step(0.01)
            g5.add(hatsADSR, 'decay', 0, 1).step(0.01)
            g5.add(hatsADSR, 'sustain', 0, 1).step(0.01)
            g5.add(hatsADSR, 'release', 0, 1).step(0.01)

            var g2 = gui.addFolder('Reverb Envelope')
            g2.add(reverb.wet, 'value', 0, 1).step(0.01)
            g2.add(reverbADSR, 'attack', 0, 1).step(0.01)
            g2.add(reverbADSR, 'decay', 0, 1).step(0.01)
            g2.add(reverbADSR, 'sustain', 0, 1).step(0.01)
            g2.add(reverbADSR, 'release', 0, 1).step(0.01)

            var g3 = gui.addFolder('Chorus')
            g3.add(chorus.frequency, 'value', 0, 2000)
            g3.add(chorus, 'delayTime', 0, 500)
            g3.add(chorus, 'depth', 0, 1).step(0.1)
            g3.add(chorus, 'spread', 0, 360)

        },
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
            this.plane.geometry.dynamic = true
            for (var i = 0; i < this.plane.geometry.vertices.length; i++) {
                this.plane.geometry.vertices[i].z = Math.random() * height
            }
            this.plane.matrixAutoUpdate = true

            this.scene.add(this.plane)


            // Oggetto in primo piano
            var cubeGeometry = new THREE.BoxGeometry(50,50,50)
            var cubeMaterial = new THREE.MeshStandardMaterial({
                // color: this.colors.black,
                // emissive: this.colors.black,
                vertexColors: THREE.FaceColors,
                roughness: 1,
                metalness: 0,
                flatShading: true
            })

            this.obj.particleSystem = new THREE.GPUParticleSystem({
                maxParticles: 250000,
                particleNoiseTex: new THREE.TextureLoader().load('/images/sprites/perlin-512.png'),
                particleSpriteTex: new THREE.TextureLoader().load('/images/sprites/sphere.png')
            })
            this.scene.add(this.obj.particleSystem)
            this.obj.particleSystem.position.set(0, 100, 40)

            this.obj.particleSystem.init()

            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
            cube.position.set(0, 65, 40)
            cube.castShadow = true
            cube.receiveShadow = true

            var testGeom = new THREE.Geometry()
            var colors = []
            for (var i = 0; i < 1000; i++) {
                var vertex = new THREE.Vector3()
                vertex.x = Math.random() * 50 - 25
                vertex.y = Math.random() * 50 + 65
                vertex.z = Math.random() * 50 - 25


                // colors[ i ] = new THREE.Color( 0xffffff );
				// colors[ i ].setHSL( ( vertex.x + 1000 ) / 2000, 1, 0.5 );
                testGeom.vertices.push(vertex)
            }
            // testGeom.colors = colors

            this.options = {
                position: testGeom,
				positionRandomness: .6,
				velocity: new THREE.Vector3(),
				velocityRandomness: .9,
				color: this.colors.black,
				colorRandomness: .1,
				turbulence: 1,
				lifetime: 2,
				size: 3,
				sizeRandomness: 3,
                transparent: true,
                opacity: 0.1,
            }


            var spriteImg = new THREE.TextureLoader().load('/images/sprites/sphere.png')
            var particleMaterial = new THREE.PointsMaterial({
                size: 2,
                color: this.colors.white,
                // vertexColors: THREE.VertexColors,
                map: spriteImg,
                alphaTest: 0.5,
                transparent: true
            })
            // particleMaterial.lights = true

            // var particles = new THREE.Points(testGeom, particleMaterial)
            // particles.position.set(0, 0, 40)
            // // this.scene.add(cube)
            // this.scene.add(particles)


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
            if (this.datGui) {
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
            }

            // HELPER
            if (this.helpers) {
                var rectLighRightHelper = new THREE.RectAreaLightHelper(rectLighRight)
                var rectLightLeftHelper = new THREE.RectAreaLightHelper(rectLightLeft)
                lightLeft.shadowCameraHelper = new THREE.CameraHelper(lightLeft.shadow.camera); // - added
                lightRight.shadowCameraHelper = new THREE.CameraHelper(lightRight.shadow.camera); // - added
                this.scene.add(lightLeft.shadowCameraHelper); // -------- added
                this.scene.add(lightRight.shadowCameraHelper); // -------- added
                this.scene.add(rectLighRightHelper)
                this.scene.add(rectLightLeftHelper)
                this.scene.add(new THREE.AxesHelper(300));
                this.scene.add(new THREE.SpotLightHelper(lightLeft, 2));
            }

            // POST PROCESSING
            if (this.postProcessingActive) {
                this.postProcessing()
            }

            window.addEventListener('resize', this.onWindowResize, false)
            window.addEventListener('mousemove', this.onMouseMove, false)
            console.log(this.obj.particleSystem)
        },
        animate: function() {
            var vue = this
            var delta = this.clock.getDelta() * this.timeScale

            requestAnimationFrame(vue.animate)

            var meter = this.audio.meters.tom.getValue()
            var meterHats = this.audio.env.hatsADSR.getValueAtTime()


            for (var i = 0; i < this.plane.geometry.vertices.length; i++) {
                var variation = this.plane.geometry.vertices[i].z + meter
                this.plane.geometry.vertices[i].z = variation
            }
            this.plane.geometry.verticesNeedUpdate = true;

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
            // this.shaders.film.uniforms['time'].value += delta
            // this.shaders.film.uniforms['sIntensity'].value = Math.random()
            // this.shaders.film.uniforms.nIntensity.value = Math.random() / 10

            this.tick += delta
            if (this.tick < 0) this.tick = 0

            if (delta > 0) {
                this.options.position.x = Math.sin(this.tick * this.spawnerOptions.horizontalSpeed) * 30 * Math.sin(meterHats) * 4
                this.options.position.y = Math.sin(this.tick * this.spawnerOptions.verticalSpeed) * 10 * Math.sin(meterHats) * 4
                this.options.position.z = Math.sin(this.tick * this.spawnerOptions.horizontalSpeed + this.spawnerOptions.verticalSpeed) * 5 * Math.sin(meterHats) * 4

                for (var i = 0; i < this.spawnerOptions.spawnRate * delta; i++) {
                    this.obj.particleSystem.spawnParticle(this.options)
                }
            }
            // this.obj.particleSystem.dispose(new THREE.Vector3(0, 100, 0))
            this.obj.particleSystem.update(this.tick)

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
            if (this.postProcessingActive) {
                this.composer.render()
            } else {
                this.renderer.render(vue.scene, vue.camera)
            }
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


            this.shaders.film.uniforms['grayscale'].value = 0
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

            this.shaders.glitch.uniforms['byp'].value = false
            // this.shaders.vBlur.renderToScreen = true
            // this.shaders.glitch.renderToScreen = true
            // dof.renderToScreen = true

        },

    },
    mounted() {
        this.init()
        this.animate()
        this.audioSetup()
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
