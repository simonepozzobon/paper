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

            },
            scale: ['C', 'D', 'Eb', 'F', 'Gb', 'Ab', 'A', 'B', 'C'],
        }
    },
    methods: {
        audioSetup: function() {
            var samplerLoaded = false,
                reverbLoaded = false,
                pianoReverbLoaded = false,
                snareLoaded = false,
                snareReverbLoaded = false,
                closedHatsLoaded = false,
                leadReverbLoaded = false

            // POLYSYNTH

            var polySynth1 = new Tone.FatOscillator({
                type: 'square',
                count: 3
            }).start()

            var polySynth2 = new Tone.FatOscillator({
                type: 'sawtooth',
                count: 3
            }).start()

            var polySynth3 = new Tone.FatOscillator({
                type: 'sawtooth',
                count: 3
            }).start()

            var polySynth4 = new Tone.FatOscillator({
                type: 'square',
                count: 3
            }).start()

            var polySynth5 = new Tone.FatOscillator({
                type: 'square',
                spread: 20,
                count: 3,
                volume: -9,
            }).start()

            var whiteNoise = new Tone.Noise({
                type: 'white'
            }).start()

            polySynth2.sync(polySynth1)
            polySynth3.sync(polySynth1)
            polySynth4.sync(polySynth1)
            polySynth5.sync(polySynth1)

            var polySynthVibrato = new Tone.Vibrato({
                frequency: 10,
                type: 'sine',
                depth: 0.2,
            })

            var polySynthADSR = new Tone.AmplitudeEnvelope({
                attack: 1,
                decay: 0.5,
                sustain: 1,
                release: 0.5,
            })

            var cutLowEnd = new Tone.Filter({
                frequency: 90,
                type: 'highpass',
                rolloff: -48,
                Q: 0.3,
            })

            var smoothHighEnd = new Tone.Filter({
                frequency: 220,
                type: 'lowpass',
                rolloff: -12,
                Q: 0.3,
            })

            var autoFilter = new Tone.AutoFilter({
                frequency: '3m',
                type: 'triangle',
                depth: .73,
                baseFrequency: 360,
                octaves: 1.6,
                filter: {
                    Q: 1.2,
                    rolloff: -24,
                }
            }).start()

            var widener = new Tone.StereoWidener({
                width: 0.7
            })

            var polySynthReverb = new Tone.Reverb({
                decay: 2.4,
                wet: .6,
            })

            var polySynthPingPong = new Tone.PingPongDelay({
                delayTime: '1m',
                feedback: .33,
                wet: 0.15
            })


            // PIANO

            var pianoSampler = new Tone.Sampler({
                'c3' : '/samples/reverse-DM7add9-Chord.mp3'
            }, function() {
                samplerLoaded = true
                startTransport()
            })

            var pianoPingPong = new Tone.PingPongDelay({
                delayTime: '2n',
                feedback: .66,
                wet: .15,
            })

            var pianoReverb = new Tone.Reverb({
                decay: 12,
                wet: .6,
            })


            // KICK

            var kick = new Tone.MembraneSynth({
                envelope: {
                    sustain: 0,
                    attack: 0.02,
                    decay: 0.8,
                },
                octaves: 6
            })


            // SNARE && HATS

            var snareSynth = new Tone.Sampler({
                'C3': '/samples/snare.mp3',
            }, function() {
                snareLoaded = true
                startTransport()
            })

            var snareReverb = new Tone.Reverb({
                decay: 1.2,
                wet: .33
            })

            var closedHats = new Tone.Sampler({
                'C3': '/samples/hats.mp3'
            }, function() {
                closedHatsLoaded = true
                startTransport()
            })

            var closedHatsHuman = new Tone.Volume(0)

            var closedHatsADSR = new Tone.AmplitudeEnvelope({
                attack: 0.01,
                decay: 0.4,
                sustain: 0,
                release: 0.0001,
            })

            var closedHatsFilter = new Tone.Filter({
                type: 'highpass',
                rolloff: -12,
                frequency: 2000,
                Q: 0.6
            })

            var closedHatsReverb = new Tone.Freeverb({
                roomSize: 1.6,
                dampening: 1000,
                wet: 0.66
            })

            var closedHatsWidener = new Tone.StereoWidener({
                width: 0.8,
                wet: 0.7,
            })


            // DRUMS PARALLEL COMPRESSION
            var drumsAux = new Tone.Volume(0)

            var bitCrusher = new Tone.BitCrusher({
                bits: 8
            })

            var drumsCompressor = new Tone.Compressor({
                ratio: 20,
                threshold: -12,
                attack: .8,
                release: 0.05,
                knee: 10,
            })

            var compressorGain = new Tone.Volume(-18)


            // LEAD

            var lead = new Tone.FMSynth({
                envelope: {
                    attack: 1,
                    sustain: 1,
                    release: 1
                }
            })

            var leadFilter = new Tone.Filter({
                frequency: 800,
                rolloff: -12
            })

            var leadReverb = new Tone.Reverb({
                decay: 2.4,
                wet: 0.66
            })

            var leadPingPong = new Tone.PingPongDelay({
                delayTime: '8n',
                feedback: .66,
                wet: 0.25
            })


            // LEAD OVERTONE

            var leadOvertone1 = new Tone.FMSynth()
            var leadOvertone2 = new Tone.PolySynth()


            // VOLUMES
            var polySynthVol = new Tone.Volume(-16)
            var noiseVol = new Tone.Volume(-22)
            var pianoVol = new Tone.Volume(0)
            var kickVol = new Tone.Volume(0)
            var snareVol = new Tone.Volume(-6)
            var closedHatVol = new Tone.Volume(-12)
            var leadVol = new Tone.Volume(-21)
            var leadOvertone1Vol = new Tone.Volume(-9)
            var leadOvertone2Vol = new Tone.Volume(-15)

            // AUX
            var drumsAuxVol = new Tone.Volume(-9)

            // MASTER CHANNEL
            var limiter = new Tone.Limiter(-0.01)

            // ROUTING
            // Sources
            polySynth1.connect(polySynthADSR)
            polySynth2.connect(polySynthADSR)
            polySynth3.connect(polySynthADSR)
            polySynth4.connect(polySynthADSR)
            polySynth5.connect(polySynthVibrato)

            polySynthVibrato.connect(polySynthADSR)

            whiteNoise.connect(noiseVol)
            noiseVol.connect(polySynthADSR)

            polySynthADSR.connect(autoFilter)
            autoFilter.connect(cutLowEnd)
            cutLowEnd.connect(polySynthReverb)
            polySynthReverb.connect(polySynthPingPong)
            polySynthPingPong.connect(smoothHighEnd)
            smoothHighEnd.connect(widener)
            widener.connect(polySynthVol)
            polySynthVol.connect(limiter)

            pianoSampler.connect(pianoPingPong)
            pianoPingPong.connect(pianoReverb)
            pianoReverb.connect(pianoVol)
            pianoVol.connect(limiter)

            kick.connect(kickVol)
            kickVol.connect(limiter)

            snareSynth.connect(snareReverb)
            snareReverb.connect(snareVol)
            snareVol.connect(limiter)

            closedHats.connect(closedHatsHuman)
            closedHatsHuman.connect(closedHatsADSR)
            closedHatsADSR.connect(closedHatsFilter)
            // closedHats.connect(closedHatsFilter)
            closedHatsFilter.connect(closedHatsReverb)
            closedHatsReverb.connect(closedHatsWidener)
            closedHatsWidener.connect(closedHatVol)
            closedHatVol.connect(limiter)

            snareReverb.connect(drumsAux)
            kick.connect(drumsAux)
            closedHats.connect(drumsAux)
            // drumsAux.connect(drumsCompressor)
            drumsAux.connect(bitCrusher)
            bitCrusher.connect(drumsCompressor)
            drumsCompressor.connect(compressorGain)
            compressorGain.connect(drumsAuxVol)
            drumsAuxVol.connect(limiter)

            lead.connect(leadFilter)
            leadFilter.connect(leadPingPong)
            leadPingPong.connect(leadReverb)
            leadReverb.connect(leadVol)
            leadVol.connect(limiter)

            leadOvertone1.connect(leadOvertone1Vol)
            leadOvertone1Vol.connect(leadReverb)

            leadOvertone2.connect(leadOvertone2Vol)
            leadOvertone2Vol.connect(leadPingPong)

            limiter.toMaster()

            var chordDM7add9 = ['D3', 'E3', 'F#3', 'A3', 'C#3']
            var chordAbM7add9 = ['F#3', 'G#3', 'A#3', 'C#4', 'F4']
            var chordDbM7add9 = ['C#3', 'D#3', 'E3', 'G#3', 'B3']
            var chordAM7add9 = ['A#3', 'C3', 'D3', 'F4', 'A4']

            var chordPart = new Tone.Part(function(time, note){
                polySynth1.frequency.value = note[0]
                polySynth2.frequency.value = note[1]
                polySynth3.frequency.value = note[2]
                polySynth4.frequency.value = note[3]
                polySynth5.frequency.value = note[4]

                polySynthADSR.triggerAttackRelease('3m', time)
            }, [[0, chordDM7add9], ['1:0', chordAbM7add9]])

            var pianoReverse = new Tone.Part(function(time, note) {
                pianoSampler.triggerAttack(note)
            }, [[0, 'C3']])

            var vue = this
            var kickSeq = new Tone.Sequence(function(time, step) {
                closedHatsHuman.volume.value = (Math.random() - 1) * 3
                closedHatsADSR.triggerAttackRelease('16n', time)
                closedHats.triggerAttack('C3')

                if (step == 0 || step == 8 || step == 14) {
                    kick.triggerAttackRelease('D1', '8n', time)
                    vue.moveLand()
                }
                if (step == 4 || step == 16) {
                    snareSynth.triggerAttack('C3')
                }
            }, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n')

            var leadSeq = new Tone.Sequence(function(time, note) {
                lead.triggerAttack(note)
            }, ['F#4', 'A4', 'C#4'], '8n')

            var leadOvertone1Seq = new Tone.Sequence(function(time, note) {
                leadOvertone1.triggerAttackRelease(note, '32n')
                var transpose = new Tone.Midi(note).transpose(+12)
                leadOvertone2.triggerAttackRelease(transpose, '32n')
            }, ['F#5', 'A5', 'C#5', 'F#5', 'E5'], '16n')

            var leadOvertone2Seq = new Tone.Sequence(function(time, note) {
                leadOvertone2.triggerAttackRelease(note, '32n')
            }, ['F#5', 'A5', 'C#5', 'F#5', 'E5', 'A5', 'C#5'], '16n')

            chordPart.loop = true
            chordPart.loopEnd = '2m'
            chordPart.humanize = true
            pianoReverse.loop = true
            pianoReverse.loopEnd = '8m'
            pianoReverse.humanize = true

            polySynthReverb.generate().then(function() {
                reverbLoaded = true
                startTransport()
            })

            pianoReverb.generate().then(function() {
                pianoReverbLoaded = true
                startTransport()
            })

            snareReverb.generate().then(function() {
                snareReverbLoaded = true
                startTransport()
            })

            leadReverb.generate().then(function() {
                leadReverbLoaded = true
                startTransport()
            })

            Tone.context.latencyHint = 'playback'

            function startTransport() {
                if (reverbLoaded && samplerLoaded && pianoReverbLoaded && snareLoaded && snareReverbLoaded && closedHatsLoaded && leadReverbLoaded) {
                    Tone.Transport.start('+0.1')
                    chordPart.start()
                    pianoReverse.start()
                    kickSeq.start()
                    leadSeq.start()
                    leadOvertone1Seq.start()
                    leadOvertone2Seq.start()
                }
            }


            // this.audioDatGui(autoFilter, polySynthReverb, widener, polySynthVol, noiseVol)

        },
        audioDatGui: function(autoFilter, polySynthReverb, widener, polySynthVol, noiseVol) {
            var gui = new dat.GUI()

            var polySynthOpts = {
                polySynthVol: polySynthVol.volume.value,
                noiseVol: noiseVol.volume.value,

                autofilter: {
                    frequency: autoFilter.frequency.value,
                    depth: autoFilter.depth.value,
                    baseFrequency: autoFilter.baseFrequency,
                    octaves: autoFilter.octaves,
                    q: autoFilter.filter.Q.value,
                },

                efx: {
                    widener: widener.width.value,
                    reverb: {
                        Reverb_wet: polySynthReverb.wet.value,
                        Reverb_decay: polySynthReverb.decay
                    }
                }
            }

            var updatePolySynth = function() {
                // Volumes
                polySynthVol.volume.value = polySynthOpts.polySynthVol
                noiseVol.volume.value = polySynthOpts.noiseVol

                // Autofilter
                autoFilter.frequency.value = polySynthOpts.autofilter.frequency
                autoFilter.baseFrequency = polySynthOpts.autofilter.baseFrequency
                autoFilter.depth.value = polySynthOpts.autofilter.depth
                autoFilter.octaves = polySynthOpts.autofilter.octaves
                autoFilter.filter.Q.value = polySynthOpts.autofilter.q

                // Efx
                widener.width.value = polySynthOpts.efx.widener
                polySynthReverb.wet.value = polySynthOpts.efx.reverb.Reverb_wet
                polySynthReverb.decay = polySynthOpts.efx.reverb.Reverb_decay
            }

            var g1 = gui.addFolder('PolySynth')

            var g1_1 = g1.addFolder('Volumes')
            g1_1.add(polySynthOpts, 'polySynthVol', -64, 0).onChange(updatePolySynth)
            g1_1.add(polySynthOpts, 'noiseVol', -64, 0).onChange(updatePolySynth)

            var g1_2 = g1.addFolder('AutoFilter')
            g1_2.add(polySynthOpts.autofilter, 'frequency', 0, 30).onChange(updatePolySynth)
            g1_2.add(polySynthOpts.autofilter, 'baseFrequency', 20, 20000).step(10).onChange(updatePolySynth)
            g1_2.add(polySynthOpts.autofilter, 'depth', 0, 1).step(0.01).onChange(updatePolySynth)
            g1_2.add(polySynthOpts.autofilter, 'octaves', 0, 10).step(0.1).onChange(updatePolySynth)
            g1_2.add(polySynthOpts.autofilter, 'q', 0, 10).step(0.1).onChange(updatePolySynth)

            var g1_3 = g1.addFolder('Efx')
            g1_3.add(polySynthOpts.efx, 'widener', 0, 1).onChange(updatePolySynth)
            g1_3.add(polySynthOpts.efx.reverb, 'Reverb_wet', 0, 1).onChange(updatePolySynth)
            g1_3.add(polySynthOpts.efx.reverb, 'Reverb_decay', 0, 5, 0.1).onChange(updatePolySynth)

        },
        moveLand: function() {

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
            this.scene.fog = new THREE.FogExp2(this.colors.black, 0.002, 1000)


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

            // var meter = this.audio.meters.tom.getValue()
            // var meterHats = this.audio.env.hatsADSR.getValueAtTime()
            //
            //
            // for (var i = 0; i < this.plane.geometry.vertices.length; i++) {
            //     var variation = this.plane.geometry.vertices[i].z + meter
            //     this.plane.geometry.vertices[i].z = variation
            // }
            // this.plane.geometry.verticesNeedUpdate = true;

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

            // this.tick += delta
            // if (this.tick < 0) this.tick = 0
            //
            // if (delta > 0) {
            //     this.options.position.x = Math.sin(this.tick * this.spawnerOptions.horizontalSpeed) * 30 * Math.sin(meterHats) * 4
            //     this.options.position.y = Math.sin(this.tick * this.spawnerOptions.verticalSpeed) * 10 * Math.sin(meterHats) * 4
            //     this.options.position.z = Math.sin(this.tick * this.spawnerOptions.horizontalSpeed + this.spawnerOptions.verticalSpeed) * 5 * Math.sin(meterHats) * 4
            //
            //     for (var i = 0; i < this.spawnerOptions.spawnRate * delta; i++) {
            //         this.obj.particleSystem.spawnParticle(this.options)
            //     }
            // }
            // // this.obj.particleSystem.dispose(new THREE.Vector3(0, 100, 0))
            // this.obj.particleSystem.update(this.tick)

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
