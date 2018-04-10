THREE.GlowShader = {

	defines: {
		"DEPTH_PACKING": 1,
		"PERSPECTIVE_CAMERA": 1,
	},

	uniforms: { },

	vertexShader: [

		"varying vec3 vNormal;",

		"void main() {",

			"vNormal = normalize( normalMatrix * normal );",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
		"#include <common>",

		"varying vec3 vNormal;",

		"#include <packing>",

		"void main() {",

			"float intensity = pow( 0.1 - dot( vNormal, vec3( 0, 1.0, 0 ) ), 1.0 );",

			"gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;",

		"}"

	].join( "\n" )

};
