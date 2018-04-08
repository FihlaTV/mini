import * as TWEEN from "@tweenjs/tween.js";


import Preloader from "./Preloader";
import ThreeStage from "./ThreeStage";
import ThreeCamera from "./ThreeCamera";
import ThreeTextures from "./ThreeTextures";
import ThreeMaterialsScene from "./ThreeMaterialsScene";
import ThreeMaterialsBody from "./ThreeMaterialsBody";
import ThreeMaterialsPaint from "./ThreeMaterialsPaint";
import ThreeMaterialsWheels from "./ThreeMaterialsWheels";
import Physics from "./Physics";
import CarBody from "./CarBody";
import CarWheels from "./CarWheels";
import CarPhysics from "./CarPhysics";
import ControlsSelectQuality from "./ControlsSelectQuality";
import ControlsSelectColor from "./ControlsSelectColor";
import ControlsKeyboard from "./ControlsKeyboard";
import ControlsTouch from "./ControlsTouch";
import SceneFloor from "./SceneFloor";
import SceneColors from "./SceneColors";
import SceneObjects from "./SceneObjects";
import Settings from "./Settings";
import {animateFog, animateSpotLight} from "./Animate";


export default class Application {

	public static async start(): Promise<void> {

		if (Settings.mobile) {
			document.body.className = "ready mobile";
		} else {
			document.body.className = "ready desktop";
		}

		await ControlsSelectQuality.wait();

		Preloader.init();

		ThreeTextures.load(Preloader.manager);
		ThreeMaterialsScene.load();
		ThreeMaterialsBody.load();
		ThreeMaterialsPaint.load();
		ThreeMaterialsWheels.load();

		ThreeStage.init();
		ThreeCamera.init();
		ThreeStage.scene.add(ThreeCamera.target);
		ThreeStage.render(ThreeCamera.camera);

		SceneFloor.init();

		window.addEventListener("resize", (): void => {
			ThreeCamera.resize();
			ThreeStage.resize();
		}, false);

		window.addEventListener("orientationchange", (): void => {
			setTimeout((): void => {
				ThreeCamera.resize();
				ThreeStage.resize();
			}, 100);
		}, false);

		this.loop();

		await Promise.all([
			SceneColors.load(Preloader.manager),
			CarBody.load(Preloader.manager),
			CarWheels.load(Preloader.manager)
		]);

		ThreeStage.scene.add(SceneColors.group);
		ThreeStage.scene.add(CarBody.group);
		ThreeStage.scene.add(CarWheels.frontLeft);
		ThreeStage.scene.add(CarWheels.frontRight);
		ThreeStage.scene.add(CarWheels.rearLeft);
		ThreeStage.scene.add(CarWheels.rearRight);

		CarBody.setPosition(0, 0, 0);
		CarWheels.setPosition(0, 0, 0);

		CarBody.update(ThreeCamera.camera);
		CarWheels.update(ThreeCamera.camera);
		ThreeStage.render(ThreeCamera.camera);

		ThreeCamera.camera.position.set(0, 100, 28);
		ThreeCamera.target.position.set(0, 100, 0);

		await animateFog(ThreeStage.fog, 100, 250, 2000);

		await ThreeCamera.animatePosition(
			[0, 2, 28],
			[0, 2, 0],
			5000
		);

		await ThreeCamera.animatePosition(
			[0, 1.2, 6],
			[0, 0.45, 0],
			500
		);

		ThreeCamera.enableZoom = true;
		ThreeCamera.enableRotate = true;
		ThreeCamera.enablePan = false;

		Physics.init();

		await ControlsSelectColor.wait();

		await SceneColors.hide();

		ThreeStage.scene.remove(SceneColors.group);
		ThreeStage.scene.add(SceneFloor.floorLeft);
		ThreeStage.scene.add(SceneFloor.floorRight);
		ThreeStage.scene.add(SceneFloor.floorRoad);
		SceneObjects.init();
		CarPhysics.init();
		this.render();

		await ThreeCamera.animateSpherical(
			180, 80, 7,
			[0, 1, 0],
			2000
		);
		ThreeCamera.setFollowTarget(CarBody.group);

		await SceneFloor.show();

		await animateSpotLight(
			ThreeStage.spotLight,
			[0, 15, 40],
			[0, 0, 40],
			4000
		);

		ThreeStage.spotLight.castShadow = false;
		CarBody.lights();
		ControlsTouch.init();
		ControlsKeyboard.init();
	}


	private static loop(): void {
		requestAnimationFrame(() => this.loop());
		this.render();
	}


	private static render(): void {
		TWEEN.update();

		Physics.update();
		ControlsTouch.update();
		ControlsKeyboard.update();
		CarPhysics.update();
		ThreeCamera.update();
		CarBody.update(ThreeCamera.camera);
		CarWheels.update(ThreeCamera.camera);
		SceneObjects.update();

		ThreeStage.render(ThreeCamera.camera);
	}
}
