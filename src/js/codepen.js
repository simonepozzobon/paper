
      var loadGitHubScript = url => fetch(url).
        then(res => res.blob()).
        then(body => loadScript(URL.createObjectURL(body)));

      var loadScript = url => new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject; // TODO Not sure it really works
        document.head.appendChild(script);
      });

      var countScript = 0

      function countLoader() {
            if (countScript == 23) {
                  initLandScape()
            }
            countScript++
      }

      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/controls/OrbitControls.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/UnpackDepthRGBAShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/ConvolutionShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/CopyShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/DigitalGlitch.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/DotScreenShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/FilmShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/HorizontalBlurShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/SepiaShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/VerticalBlurShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/VignetteShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/shaders/BokehShader.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/postprocessing/EffectComposer.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/postprocessing/RenderPass.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/postprocessing/BokehPass.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/postprocessing/FilmPass.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/postprocessing/GlitchPass.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/postprocessing/TexturePass.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/postprocessing/ShaderPass.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/postprocessing/MaskPass.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/utils/ShadowMapViewer.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/GPUParticleSystem.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/renderers/Projector.js').then(() => {countLoader()})
      loadGitHubScript('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/renderers/CanvasRenderer.js').then(() => {countLoader()})

      var
            samplerLoaded = false,
            reverbLoaded = false,
            pianoReverbLoaded = false,
            snareLoaded = false,
            snareReverbLoaded = false,
            closedHatsLoaded = false,
            leadReverbLoaded = false,
            composer,
            colors = {
                  white: 0xffffff,
                  black: 0x191919,
                  gray: 0xcccccc,
                  yellow: 0xF5A623,
                  purple: 0xff00ff,
                  red: 0xff0000,
            },
            shaders = {
                  mainRender: null,
                  film: null,
                  glitch: null,
                  hBlur: null,
                  vignette: null,
                  vBlur: null,
            },
            size = {
                  width: 0,
                  height: 0,
            },
            renderer,
            scene,
            camera,
            segments = 128,
            height = 30,
            plane,
            geometryPlane,
            materialPlane,
            lightLeft,
            lightRight,
            rectLightLeft,
            rectLighRight,
            polySynth1,
            polySynth2,
            polySynth3,
            polySynth4,
            polySynth5,
            whiteNoise,
            polySynthVibrato,
            polySynthADSR,
            cutLowEnd,
            smoothHighEnd,
            autoFilter,
            widener,
            polySynthReverb,
            polySynthPingPong,
            pianoSampler,
            pianoPingPong,
            pianoReverb,
            kick,
            snareSynth,
            snareReverb,
            closedHats,
            closedHatsHuman,
            closedHatsADSR,
            closedHatsFilter,
            closedHatsReverb,
            closedHatsWidener,
            drumsAux,
            bitCrusher,
            drumsCompressor,
            compressorGain,
            lead,
            leadFilter,
            leadReverb,
            leadPingPong,
            leadOvertone1,
            leadOvertone2,
            polySynthVol,
            noiseVol,
            pianoVol,
            kickVol,
            snareVol,
            closedHatVol,
            leadVol,
            leadOvertone1Vol,
            leadOvertone2Vol,
            polySynthVol,
            noiseVol,
            pianoVol,
            kickVol,
            snareVol,
            closedHatVol,
            leadVol,
            leadOvertone1Vol,
            leadOvertone2Vol,
            drumsAuxVol,
            limiter,
            chordDM7add9,
            chordAbM7add9,
            chordDbM7add9,
            chordAM7add9,
            chordPart,
            pianoReverse,
            kickSeq,
            leadSeq,
            leadOvertone1Seq,
            transpose,
            leadOvertone2Seq




      function initLandScape() {

            size.width = window.innerWidth
            size.height = window.innerHeight


            // Scene
            scene = new THREE.Scene()
            scene.background = new THREE.Color(colors.black)
            scene.fog = new THREE.FogExp2(colors.black, 0.002, 1000)


            // Renderer
            renderer = new THREE.WebGLRenderer({
                antialias: true
            })
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(size.width, size.height)

            renderer.autoClear = false
            renderer.gammaInput = true
            renderer.gammaOutput = true

            renderer.shadowMap.enabled = true
            renderer.shadowMap.type = THREE.PCFSoftShadowMap
            document.body.appendChild(renderer.domElement)


            // CAMERA
            camera = new THREE.PerspectiveCamera(45, size.width / size.height, 1, 10000)
            camera.position.set(0, 110, 300)
            camera.far = 350
            camera.rotation.x = -0.25

            // SCENE OBJS
            geometryPlane = new THREE.PlaneGeometry(2500, 2500, segments, segments)
            geometryPlane.computeFaceNormals()
            geometryPlane.computeVertexNormals()

            materialPlane = new THREE.MeshStandardMaterial({
                color: colors.black,
                side: THREE.FrontSide,
                vertexColors: THREE.FaceColors,
                flatShading: true,
                roughness: 1,
                metalness: 0,
            })

            plane = new THREE.Mesh(geometryPlane, materialPlane)
            plane.name = 'Terrain'
            plane.rotation.x = -90 * Math.PI / 180
            plane.castShadow = true
            plane.receiveShadow = true
            plane.geometry.dynamic = true
            for (var i = 0; i < plane.geometry.vertices.length; i++) {
                plane.geometry.vertices[i].z = Math.random() * height
            }
            plane.matrixAutoUpdate = true

            scene.add(plane)



            // ILLUMINAZIONE
            lightLeft = new THREE.SpotLight(colors.white, .1);
            lightLeft.castShadow = true;
            lightLeft.shadow.camera.left = -50; // --------- added
            lightLeft.shadow.camera.right = 50;
            lightLeft.shadow.camera.top = 50;
            lightLeft.shadow.camera.bottom = -50;
            lightLeft.shadow.camera.near = 10;
            lightLeft.shadow.camera.far = 400;
            lightLeft.position.set(-220, 550, -180);
            scene.add(lightLeft);

            lightRight = new THREE.SpotLight(colors.white, .08);
            lightRight.castShadow = true;
            lightRight.shadow.camera.left = -50; // --------- added
            lightRight.shadow.camera.right = 50;
            lightRight.shadow.camera.top = 50;
            lightRight.shadow.camera.bottom = -50;
            lightRight.shadow.camera.near = 10;
            lightRight.shadow.camera.far = 400;
            lightRight.position.set(220, 550, -180);
            scene.add(lightRight);

            rectLightLeft = new THREE.RectAreaLight(colors.yellow, 50, 2, 30)
            rectLightLeft.position.set(-100, 230, 250)
            rectLightLeft.rotation.x = Math.PI / 8 * 5
            rectLightLeft.rotation.y = Math.PI / 8 * 1
            scene.add(rectLightLeft)

            rectLighRight = new THREE.RectAreaLight(colors.yellow, 50, 2, 30)
            rectLighRight.position.set(100, 230, 250)
            rectLighRight.rotation.x = Math.PI / 8 * 5
            rectLighRight.rotation.y = Math.PI / 8 * - 1
            scene.add(rectLighRight)


            // POST PROCESSING
            postProcessing()

            window.addEventListener('resize', onWindowResize, false)
            window.addEventListener('mousemove', onMouseMove, false)

            // AUDIO INIT
            initAudio()
      }

      function onWindowResize() {
            size.width = window.innerWidth
            size.height = window.innerHeight
            camera.aspect = size.width / size.height

            camera.updateProjectionMatrix()
            scene.fog = new THREE.FogExp2(colors.black, 0.002, 1000)

            renderer.setSize(size.width, size.height)

            render()
      }

      function onMouseMove() {

      }

      function postProcessing() {
            //COMPOSER
            composer = new THREE.EffectComposer(renderer)

            //PASSES
            shaders.mainRender = new THREE.RenderPass(scene, camera)
            shaders.film = new THREE.ShaderPass(THREE.FilmShader)
            shaders.glitch = new THREE.GlitchPass()
            shaders.hBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader)
            shaders.vignette = new THREE.ShaderPass(THREE.VignetteShader)
            shaders.vBlur = new THREE.ShaderPass(THREE.VerticalBlurShader)


            shaders.film.uniforms['grayscale'].value = 0
            shaders.vignette.uniforms['offset'].value = 1.2
            shaders.vignette.uniforms['darkness'].value = 1.2
            shaders.hBlur.uniforms['h'].value = 0.0002
            shaders.vBlur.uniforms['v'].value = 0.0002


            composer.addPass(shaders.mainRender)
            composer.addPass(shaders.vignette)
            composer.addPass(shaders.film)
            composer.addPass(shaders.hBlur)
            composer.addPass(shaders.vBlur)

            shaders.film.renderToScreen = true

            shaders.glitch.uniforms['byp'].value = false
      }

      function render() {
            composer.render()
            // renderer.render(scene, camera)
      }

      function initAudio() {
            polySynth1 = new Tone.FatOscillator({
                type: 'square',
                count: 3
            }).start()

            polySynth2 = new Tone.FatOscillator({
                type: 'sawtooth',
                count: 3
            }).start()

            polySynth3 = new Tone.FatOscillator({
                type: 'sawtooth',
                count: 3
            }).start()

            polySynth4 = new Tone.FatOscillator({
                type: 'square',
                count: 3
            }).start()

            polySynth5 = new Tone.FatOscillator({
                type: 'square',
                spread: 20,
                count: 3,
                volume: -9,
            }).start()

            whiteNoise = new Tone.Noise({
                type: 'white'
            }).start()

            polySynth2.sync(polySynth1)
            polySynth3.sync(polySynth1)
            polySynth4.sync(polySynth1)
            polySynth5.sync(polySynth1)

            polySynthVibrato = new Tone.Vibrato({
                frequency: 10,
                type: 'sine',
                depth: 0.2,
            })

            polySynthADSR = new Tone.AmplitudeEnvelope({
                attack: 1,
                decay: 0.5,
                sustain: 1,
                release: 0.5,
            })

            cutLowEnd = new Tone.Filter({
                frequency: 90,
                type: 'highpass',
                rolloff: -48,
                Q: 0.3,
            })

            smoothHighEnd = new Tone.Filter({
                frequency: 220,
                type: 'lowpass',
                rolloff: -12,
                Q: 0.3,
            })

            autoFilter = new Tone.AutoFilter({
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

            widener = new Tone.StereoWidener({
                width: 0.7
            })

            polySynthReverb = new Tone.Reverb({
                decay: 2.4,
                wet: .6,
            })

            polySynthPingPong = new Tone.PingPongDelay({
                delayTime: '1m',
                feedback: .33,
                wet: 0.15
            })


            // PIANO

            pianoSampler = new Tone.Sampler({
                'c3' : 'https://cors-anywhere.herokuapp.com/https://www.simonepozzobon.com/content/reverse-DM7add9-Chord.mp3'
            }, function() {
                samplerLoaded = true
                startTransport()
            })

            pianoPingPong = new Tone.PingPongDelay({
                delayTime: '2n',
                feedback: .66,
                wet: .15,
            })

            pianoReverb = new Tone.Reverb({
                decay: 12,
                wet: .6,
            })


            // KICK

            kick = new Tone.MembraneSynth({
                envelope: {
                    sustain: 0,
                    attack: 0.02,
                    decay: 0.8,
                },
                octaves: 6
            })


            // SNARE && HATS

            snareSynth = new Tone.Sampler({
                'C3': 'https://cors-anywhere.herokuapp.com/https://www.simonepozzobon.com/content/snare.mp3',
            }, function() {
                snareLoaded = true
                startTransport()
            })

            snareReverb = new Tone.Reverb({
                decay: 1.2,
                wet: .33
            })

            closedHats = new Tone.Sampler({
                'C3': 'https://cors-anywhere.herokuapp.com/https://www.simonepozzobon.com/content/hats.mp3'
            }, function() {
                closedHatsLoaded = true
                startTransport()
            })

            closedHatsHuman = new Tone.Volume(0)

            closedHatsADSR = new Tone.AmplitudeEnvelope({
                attack: 0.01,
                decay: 0.4,
                sustain: 0,
                release: 0.0001,
            })

            closedHatsFilter = new Tone.Filter({
                type: 'highpass',
                rolloff: -12,
                frequency: 2000,
                Q: 0.6
            })

            closedHatsReverb = new Tone.Freeverb({
                roomSize: 1.6,
                dampening: 1000,
                wet: 0.66
            })

            closedHatsWidener = new Tone.StereoWidener({
                width: 0.8,
                wet: 0.7,
            })


            // DRUMS PARALLEL COMPRESSION
            drumsAux = new Tone.Volume(0)

            bitCrusher = new Tone.BitCrusher({
                bits: 8
            })

            drumsCompressor = new Tone.Compressor({
                ratio: 20,
                threshold: -12,
                attack: .8,
                release: 0.05,
                knee: 10,
            })

            compressorGain = new Tone.Volume(-18)

            lead = new Tone.FMSynth({
                envelope: {
                    attack: 1,
                    sustain: 1,
                    release: 1
                }
            })

            leadFilter = new Tone.Filter({
                frequency: 800,
                rolloff: -12
            })

            leadReverb = new Tone.Reverb({
                decay: 2.4,
                wet: 0.66
            })

            leadPingPong = new Tone.PingPongDelay({
                delayTime: '8n',
                feedback: .66,
                wet: 0.25
            })


            // LEAD OVERTONE

            leadOvertone1 = new Tone.FMSynth()
            leadOvertone2 = new Tone.PolySynth()


            // VOLUMES
            polySynthVol = new Tone.Volume(-16)
            noiseVol = new Tone.Volume(-22)
            pianoVol = new Tone.Volume(0)
            kickVol = new Tone.Volume(0)
            snareVol = new Tone.Volume(-6)
            closedHatVol = new Tone.Volume(-12)
            leadVol = new Tone.Volume(-21)
            leadOvertone1Vol = new Tone.Volume(-9)
            leadOvertone2Vol = new Tone.Volume(-15)

            // AUX
            drumsAuxVol = new Tone.Volume(-9)

            // MASTER CHANNEL
            limiter = new Tone.Limiter(-0.01)

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

            chordDM7add9 = ['D3', 'E3', 'F#3', 'A3', 'C#3']
            chordAbM7add9 = ['F#3', 'G#3', 'A#3', 'C#4', 'F4']
            chordDbM7add9 = ['C#3', 'D#3', 'E3', 'G#3', 'B3']
            chordAM7add9 = ['A#3', 'C3', 'D3', 'F4', 'A4']

            chordPart = new Tone.Part(function(time, note){
                polySynth1.frequency.value = note[0]
                polySynth2.frequency.value = note[1]
                polySynth3.frequency.value = note[2]
                polySynth4.frequency.value = note[3]
                polySynth5.frequency.value = note[4]

                polySynthADSR.triggerAttackRelease('3m', time)
            }, [[0, chordDM7add9], ['1:0', chordAbM7add9]])

            pianoReverse = new Tone.Part(function(time, note) {
                pianoSampler.triggerAttack(note)
            }, [[0, 'C3']])

            kickSeq = new Tone.Sequence(function(time, step) {
                closedHatsHuman.volume.value = (Math.random() - 1) * 3
                closedHatsADSR.triggerAttackRelease('16n', time)
                closedHats.triggerAttack('C3')

                if (step == 0 || step == 8 || step == 14) {
                    kick.triggerAttackRelease('D1', '8n', time)
                }
                if (step == 4 || step == 16) {
                    snareSynth.triggerAttack('C3')
                }
            }, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n')

            leadSeq = new Tone.Sequence(function(time, note) {
                lead.triggerAttack(note)
            }, ['F#4', 'A4', 'C#4'], '8n')

            leadOvertone1Seq = new Tone.Sequence(function(time, note) {
                leadOvertone1.triggerAttackRelease(note, '32n')
                transpose = new Tone.Midi(note).transpose(+12)
                leadOvertone2.triggerAttackRelease(transpose, '32n')
            }, ['F#5', 'A5', 'C#5', 'F#5', 'E5'], '16n')

            leadOvertone2Seq = new Tone.Sequence(function(time, note) {
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

            // Tone.context.latencyHint = 'playback'
      }

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
