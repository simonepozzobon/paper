import * as THREE from 'three'
window.THREE = THREE

require('three/examples/js/controls/OrbitControls')

require('three/examples/js/shaders/UnpackDepthRGBAShader')
require('three/examples/js/shaders/ConvolutionShader')
require('three/examples/js/shaders/CopyShader')
require('three/examples/js/shaders/DigitalGlitch')
require('three/examples/js/shaders/DotScreenShader')
require('three/examples/js/shaders/FilmShader')
require('three/examples/js/shaders/HorizontalBlurShader')
require('three/examples/js/shaders/SepiaShader')
require('three/examples/js/shaders/VerticalBlurShader')
require('three/examples/js/shaders/VignetteShader')
require('three/examples/js/shaders/BokehShader')

require('three/examples/js/postprocessing/EffectComposer')
require('three/examples/js/postprocessing/RenderPass')
require('three/examples/js/postprocessing/BloomPass')
require('three/examples/js/postprocessing/BokehPass')
require('three/examples/js/postprocessing/FilmPass')
require('three/examples/js/postprocessing/GlitchPass')
require('three/examples/js/postprocessing/TexturePass')
require('three/examples/js/postprocessing/ShaderPass')
require('three/examples/js/postprocessing/MaskPass')

require('three/examples/js/utils/ShadowMapViewer')
require('three/examples/js/GPUParticleSystem')

require('three/examples/js/renderers/Projector')
require('three/examples/js/renderers/CanvasRenderer')

require('./shaders/GlowShader')
export default THREE
