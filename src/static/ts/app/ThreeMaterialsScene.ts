import * as THREE from "three";


import ThreeTextures from "./ThreeTextures";
import Settings from "./Settings";


export default class ThreeMaterialsScene {


	public static backside: THREE.MeshBasicMaterial;
	public static floor: THREE.MeshPhongMaterial;
	public static ramp: THREE.MeshPhongMaterial;
	public static road: THREE.MeshPhysicalMaterial;


	public static load(): void {

		this.backside = new THREE.MeshBasicMaterial({
			color: 0x0B0B0B,
			side: THREE.BackSide
		});

		this.floor = new THREE.MeshPhongMaterial(<any>{
			color: 0x111111,
			specular: 0x111111,
			shininess: 0,
			reflectivity: 0
		});

		this.ramp = new THREE.MeshPhongMaterial(<any>{
			color: 0x111111,
			specular: 0x111111,
			shininess: 0,
			reflectivity: 0
		});

		this.road = new THREE.MeshPhysicalMaterial({
			color: 0xFFFFFF,
			metalness: 0,
			roughness: 0.6,
			clearCoat: 1,
			clearCoatRoughness: 0.6,
			reflectivity: 0
		});

		if (Settings.highQuality) {
			this.floor.bumpMap = ThreeTextures.noiseTexture;
			this.floor.bumpScale = 0.005;
			this.ramp.bumpMap = ThreeTextures.noiseTextureLarge;
			this.ramp.bumpScale = 0.005;
		}
	}

}
