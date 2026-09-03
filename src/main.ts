// Entry point, Phaser game config and scene list.
import Phaser from 'phaser';
import {BootScene} from './scenes/BootScene.ts';
import {PreloadScene} from './scenes/PreloadScene.ts';
import {GameScene} from './scenes/GameScene.ts';
import {UIScene} from './scenes/UIScene.ts';
const config: Phaser.Types.Core.GameConfig={type: Phaser.AUTO, parent: 'game-container', width: 1024, height: 768, backgroundColor: '#05010f', scale: {mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH}, fps: {target: 60, smoothStep: true}, disableContextMenu: true, scene: [BootScene, PreloadScene, GameScene, UIScene]};
const game: Phaser.Game=new Phaser.Game(config);
export default game;
