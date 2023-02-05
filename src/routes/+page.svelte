<script lang="ts">
  import * as THREE from 'three'
  import * as SC from 'svelte-cubed'

  import { vert } from '../shaders/vert'
  import { frag } from '../shaders/frag'

  const defaultColors = [
    [0.01568, 0.23921, 0.36470], // Indigo
    [0.01176, 0.18039, 0.27450], // Navy
    [0.05882, 0.34901, 0.36862], // Jungle Green
    [0.13725, 0.71372, 0.51764], // Mint
  ]

  const invalidLoginColors = [
    [0.48235, 0.07843, 0.46274], // Violet
    [0.38431, 0.01568, 0.34901], // Dark Purple
    [0.43921, 0.03921, 0.03921], // Blook Red
    [0.79215, 0.20392, 0.08627], // Cherry Red
  ]

  // button state here
  let isToggled = true
  
  // configure color palette for affect
  const colors = defaultColors.map(([R, G, B]) => { return new THREE.Color(R, G, B) })
    
  const waterMaterial = new THREE.ShaderMaterial({
     vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },                                      // used to animate motion

        uColors: { value: colors },                              // array of 4 colors
        uColorMultiplier: { value: 0.55 },                        // controls the strength of the mix effect

        uBigWavesFreq: { value: new THREE.Vector2(8.11, 4.33) },  // the frequency of the waves in the X, Z directions

        uBigWavesSpeed: { value: 0.1 },                           // constant to multiply uTime with
        uSmallWavesSpeed: { value: 0.1 },                         // constant to multiply uTime with 
        uBigWavesElevation: { value: 0.1 },                       // constant to multiply wave height by
        uSmallWavesElevation: { value: 0.1 },                     // constant to multiply wave noise height by

      }
  })

  /**
   * basic timeout
   */ 
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
 
  /**
   * used to handle ease-in-out logic for mesh
   */ 
  function* interpolateColors(startCol: number[], endCol: number[]) {
    const [rStart, rEnd] = [startCol[0], endCol[0]]
    const [gStart, gEnd] = [startCol[1], endCol[1]]
    const [bStart, bEnd] = [startCol[2], endCol[2]]

    const deltaR = (rEnd - rStart)
    const deltaG = (gEnd - gStart)
    const deltaB = (bEnd - bStart)

    for (let i = 1; i <= 60; i++) {
      const x = i / 60

      // Bezier outputs value (0 - 1)
      // for domain of [0 - 1] looks curvy
      // this will make the tansition smooth
      const Bezier = x * x * (3 - 2 * x)

      const rStep = rStart + (deltaR * Bezier)
      const gStep = gStart + (deltaG * Bezier)
      const bStep = bStart + (deltaB * Bezier)

      const RGB = [rStep, gStep, bStep]
      yield RGB
    }
  }

  /**
   * shifts background to red
   */
  async function blueToRed() {
    const gen1 = interpolateColors(defaultColors[0], invalidLoginColors[0])
    const gen2 = interpolateColors(defaultColors[1], invalidLoginColors[1])
    const gen3 = interpolateColors(defaultColors[2], invalidLoginColors[2])
    const gen4 = interpolateColors(defaultColors[3], invalidLoginColors[3])

    for (let i = 0; i < 60; i++) {
      // target 60fps = 16.67 ms a frame
      await sleep(16.6666) 

      const RGBVals = [
        (gen1.next()).value,
        (gen2.next()).value,
        (gen3.next()).value,
        (gen4.next()).value,
      ]

      // configure color palette for affect
      const colors = RGBVals.map(([R, G, B]) => { return new THREE.Color(R, G, B) })

      // Update Material
      waterMaterial.uniforms.uColors.value = colors
    }
    isToggled = !isToggled
  }

   /**
   * shifts background to blue
   */
  async function redToBlue() {
    const gen1 = interpolateColors(invalidLoginColors[0], defaultColors[0])
    const gen2 = interpolateColors(invalidLoginColors[1], defaultColors[1])
    const gen3 = interpolateColors(invalidLoginColors[2], defaultColors[2])
    const gen4 = interpolateColors(invalidLoginColors[3], defaultColors[3])

    for (let i = 0; i < 60; i++) {
      // target 60fps = 16.67 ms a frame
      await sleep(16.6666) 

      const RGBVals = [
        (gen1.next()).value,
        (gen2.next()).value,
        (gen3.next()).value,
        (gen4.next()).value,
      ]

      // configure color palette for affect
      const colors = RGBVals.map(([R, G, B]) => { return new THREE.Color(R, G, B) })

      // Update Material
      waterMaterial.uniforms.uColors.value = colors
    }
    isToggled = !isToggled
  }

  /**
   * event loop and animation
   */
  SC.onFrame(() => {
    waterMaterial.uniforms.uTime.value += 0.008
  })
</script>

<SC.Canvas antialias>
  <SC.Mesh 
    geometry={new THREE.PlaneGeometry(2, 2, 128, 128)} 
    material={waterMaterial} 
    rotation={[-Math.PI * 0.5, 0, 0]}
  />
	<SC.PerspectiveCamera fov={34} position={[0.35, 0.43, 0.44]} />
</SC.Canvas>

<button on:click={isToggled == true ? blueToRed : redToBlue}>Flip.</button>

<style>
  button {
    z-index: 1;
    padding: 5rem;
    border: none;
    font-size: 2rem;
    font-weight: 900;
    color: #3ca23e;
  }

  button:active {
    scale: 0.97;
  }
</style>
