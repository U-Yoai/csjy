
//=============================================================================
// QuickTimeEvent.js
// Copyright (c) 2021- 村人Ａ
//=============================================================================

/*:ja
 * @plugindesc プラグインコマンドを実行した際にQTEを発生させ、結果をスイッチに格納します。
 * @author 村人Ａ
 * @target MZ
 *
 * @help
 * ＊このプラグインは端音様専用に作られたプラグインです。
 * ＊その他の方の無断の使用を禁止します。
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * バージョン情報
 * 
 * 23/06/15 バージョン1.1 不具合修正
 * 23/06/14 バージョン1.0 試作品リリース
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * ========================================
 * 以下ヘルプ
 * ========================================
 * 
 * 〇使用画像について
 * 
 * QTEシステムに使用する画像は全てimg/systemフォルダに保存してください。
 * QTEのフレームはqteFrame.png
 * QTEの成功バーはqteHitArea.png
 * QTEの矢印はqtePointing.png
 * という名前で保存してください。
 * 
 * QTEフレームについては左右の余白は無いようにしてください。
 * 矢印の移動幅はフレーム画像の幅とプラグインパラメータ「ゲージフレームの太さ」から計算されるためです。
 * ゲージの幅についてもフレームと同じ幅で用意してください。
 * サンプル画像に正常に動作する画像がありますのでよろしければそちらをご使用ください。
 * 
 * 〇プラグインコマンドについて
 * 
 * このプラグインにはプラグインコマンド
 * 
 * QTE表示
 * QTE非表示
 * QTEスタート
 * 
 * の３つのプラグインコマンドがあります。
 * 
 * 「QTE表示」でＱＴＥに使用する各パーツを表示します。
 * ＱＴＥの準備段階等で使ってください。
 * 
 * 「QTEスタート」でＱＴＥの矢印が動きます。
 * この状態で決定キーを押下すると成功か失敗かが決定します。
 * 決定キーを押下したあともＱＴＥパーツは表示されたままとなります。
 * 次のコマンドでこれらを消してください。
 * 
 * 「QTE非表示」でＱＴＥに使用する各パーツを隠します。
 * ＱＴＥ終了時に実行してください。
 * 
 * 
 * 〇変数について
 * 
 * タイマー、成功バーの長さ、矢印の移動速度についてはプラグインパラメータで指定した変数の値が参照されます。
 * プラグインコマンド実行前にこれらの変数について設定してください。
 * タイマーは秒数、成功バーの長さは割合、矢印の移動速度は1フレーム毎の移動ピクセル量となります。
 * 
 * 
 * @param na1
 * @text ゲージ調整位置
 * @desc ゲージの画面中央からの調整位置をｘ座標,ｙ座標で指定します。
 * @default 0,0
 *
 * @param na2
 * @text タイマーの位置
 * @desc タイマーの位置をｘ座標,ｙ座標で指定します。
 * @default 0,0
 *
 * @param n1
 * @text ゲージフレームの太さ
 * @desc ゲージフレームの太さを指定します。矢印が左右に往復する位置に関係します。
 * @default 6
 *
 * @param n2
 * @text QTE結果代入スイッチID
 * @desc QTE結果代入スイッチID
 * @type switch
 * @default 1
 *
 * @param n3
 * @text タイマー秒数指定変数ID
 * @desc タイマーの秒数を設定する変数のＩＤを指定します。
 * @type variable
 * @default 1
 *
 * @param n4
 * @text 成功バー割合変数ID
 * @desc 成功バーの全長に対する割合で長さを決める際に使用する変数のIDを指定します。
 * @type variable
 * @default 2
 *
 * @param n5
 * @text 矢印移動速度変数ID
 * @desc 矢印の移動速度を決める変数のIDを指定します。
 * @type variable
 * @default 3
 *
 * @param audio1
 * @text QTE成功時のSE
 * @desc QTE成功時のSEをファイル名,音量,ピッチ,位相で指定します。
 * @default Chime1,80,100,0
 *
 * @param audio2
 * @text QTE失敗時のSE
 * @desc QTE失敗時のSEをファイル名,音量,ピッチ,位相で指定します。
 * @default Buzzer1,80,100,0
 *
 * 
 * 
 * @command showQteParts
 * @text QTE表示
 * @desc QTEを表示させます。
 *
 * @command hideQteParts
 * @text QTE非表示
 * @desc QTEを非表示させます。
 *
 * @command startQte
 * @text QTEスタート
 * @desc QTEスタートをスタートさせます。
 *
 *
*/

{	
	'use strict';
	
	const pluginName = "QuickTimeEvent";
    const param = PluginManager.parameters(pluginName);
	
	String.prototype.toNumArray = function() {
		if(this == ""){return []};
		return this.split(',').map(str => Number(str));
	}
	
	String.prototype.getRandomFromArray = function() {
		if(this == ""){return 0};
		const arr = this.toNumArray();
		if(arr.length != 2){throw new Error("getRandomFormArrayの引数に不正があります")};
		return arr[0] + Math.round(Math.random() * (arr[1] - arr[0]))
	}
	
	String.prototype.toVaribleOrNum = function() {
		if(this[0].toLowerCase() == "v"){
			const num = this.slice(1)
			return $gameVariables.value(Number(num));
		} else {
			return Number(this);
		}
	}
	
	String.prototype.toAudioParam = function(){
		const a = this.split(",").map((str, ind) => {return ind > 0 ? Number(str) : str});
		return {name:a[0], volume:a[1], pitch:a[2], pan:a[3]};
	}
	
	Array.prototype.getRandomOne = function() {
		return this[Math.floor(Math.random() * this.length)];
	}
	
	Array.prototype.getRandomExtract = function() {
		return this.filter(p => Math.random() < 0.5);
	}
	
	const getRandomResult = (rate) => {
		return rate > Math.round(100 * Math.random());
	}
	
	const convertObjectParam = (ob) => {
		Object.keys(ob).forEach(key => {
			if(key[0] == "a" && key[1] == "u" && key[2] == "d" && key[3] == "i" && key[4] == "o"){
				ob[key] = ob[key].toAudioParam();
			} else if(key[0] == "n" && key[1] == "a" && key[2] == "a"){
				ob[key] = JSON.parse(ob[key]).map(str => str.toNumArray());
			} else if(key[0] == "o" && key[1] == "n" && key[2] == "a"){
				ob[key] = JSON.parse(ob[key]).map(str => Number(str));
			} else if(key[0] == "n" && key[1] == "a"){
				ob[key] = ob[key].toNumArray();
			} else if(key[0] == "n"){
				ob[key] = Number(ob[key]);
			} else if(key[0] == "o" && key[1] == "s" && key[2] == "a" && key[3] == "a"){
				ob[key] = JSON.parse(ob[key]).map(str => JSON.parse(str));
			} else if(key[0] == "s" && key[1] == "a" && key[2] == "a"){
				ob[key] = JSON.parse(ob[key]).map(str => str.split(','));
			} else if(key[0] == "o" && key[1] == "s" && key[2] == "a"){
				ob[key] = JSON.parse(ob[key]);
			} else if(key[0] == "s" && key[1] == "a"){
				ob[key] = JSON.parse(ob[key]);
			} else if(key[0] == "s"){
				ob[key] = ob[key];
			} else if(key[0] == "b"){
				ob[key] = JSON.parse(ob[key]);
			} else if(key[0] == "o" && key[1] == "b" && key[2] == "a"){
				ob[key] = convertObjectArrayParam(ob[key])
			} else if(key[0] == "o" && key[1] == "b"){
				ob[key] = convertObjectParam(JSON.parse(ob[key]))
			}
		})
		return ob;
	}
	
	const convertObjectArrayParam = (object) => {
		let json = JSON.parse(object).map(str => JSON.parse(str));
		json.map(ob => convertObjectParam(ob))
		return json
	}
	
	const _ = convertObjectParam(param)
	
	Sprite.prototype.promiseLoadBitmap = function(imf, imgName, loadCallback) {
		if(!imgName || imgName == ""){
			throw new Error("画像名が不正です。画像名：" + imgName)
		}
		
		let b = ImageManager[imf](imgName);
		function load() {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					b = ImageManager[imf](imgName);
					resolve();
				}, 3);
			});
		}

		function load_func() {
			if (b._loadingState == "loaded") {
				return Promise.resolve();
			} else {
				return load().then(n => {
					return load_func();
				});
			}
		}

		load_func().then(num => {
			loadCallback.call(this);
		});
	}
	
	//-----------------------------------------------------------------------------
	// PluginManager
	//

    PluginManager.registerCommand(pluginName, "showQteParts", args => {
		if(SceneManager._scene._spriteset){
			SceneManager._scene._spriteset.showQteParts();
		}
    });

    PluginManager.registerCommand(pluginName, "hideQteParts", args => {
		if(SceneManager._scene._spriteset){
			SceneManager._scene._spriteset.hideQteParts();
		}
    });

    PluginManager.registerCommand(pluginName, "startQte", args => {
		if(SceneManager._scene._spriteset){
			SceneManager._scene._spriteset.startQteProc();
		}
    });

	//-----------------------------------------------------------------------------
	// Game_Interpreter
	//

	const _alias_Game_Interpreter_command357 = Game_Interpreter.prototype.command357;
	Game_Interpreter.prototype.command357 = function(params) {
		_alias_Game_Interpreter_command357.call(this, params)
		if(params[0] == pluginName && params[1] == "startQte"){
			this._waitMode = 'qteMode';
		}
		return true;
	};

	const _alias_Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
	Game_Interpreter.prototype.updateWaitMode = function() {
		if(this._waitMode == 'qteMode') {
			return $gameTemp.qteGameFaseNumber >= 0;
		} else {
			return _alias_Game_Interpreter_updateWaitMode.call(this)
		}
	}

	//-----------------------------------------------------------------------------
	// Scene_Map
	//

	const _alias_Scene_Map_initialize = Scene_Map.prototype.initialize;
	Scene_Map.prototype.initialize = function() {
		_alias_Scene_Map_initialize.call(this);
		const fileName = ["qteHitArea","qteFrame","qteHitArea"];
		for(let name of fileName){
			ImageManager.loadSystem(name);
		}
	}

	//-----------------------------------------------------------------------------
	// Scene_Battle
	//

	const _alias_Scene_Battle_initialize = Scene_Battle.prototype.initialize;
	Scene_Battle.prototype.initialize = function() {
		_alias_Scene_Battle_initialize.call(this);
		const fileName = ["qteHitArea","qteFrame","qteHitArea"];
		for(let name of fileName){
			ImageManager.loadSystem(name);
		}
	}

	//-----------------------------------------------------------------------------
	// Spriteset_Base
	//

	Spriteset_Base.prototype.createQuickTimeEventParts = function(parent) {
		$gameTemp.qteGameFaseNumber = -1;
		const px = Graphics.width/2 + _.na1[0];
		const py = Graphics.height/2 + _.na1[1];
		this.quickTimeEventLayer = new Sprite();
		this.quickTimeEventLayer.visible = false;
		parent.addChild(this.quickTimeEventLayer)
		this.qte_background = new Sprite();
		this.qte_background.bitmap = ImageManager.loadSystem("qteBackGround");
		this.qte_background.x = px
		this.qte_background.y = py
		this.qte_background.anchor.x = this.qte_background.anchor.y = 0.5;
		this.quickTimeEventLayer.addChild(this.qte_background)
		const frameBitmap = ImageManager.loadSystem("qteFrame")
		this.qte_bar = new Sprite();
		this.qte_bar.bitmap = new Bitmap(frameBitmap.width, frameBitmap.height);
		this.qte_bar.x = px
		this.qte_bar.y = py
		this.qte_bar.anchor.x = this.qte_bar.anchor.y = 0.5;
		this.quickTimeEventLayer.addChild(this.qte_bar)
		this.qte_barFrame = new Sprite();
		this.qte_barFrame.bitmap = ImageManager.loadSystem("qteFrame");
		this.qte_barFrame.x = px
		this.qte_barFrame.y = py
		this.qte_barFrame.anchor.x = this.qte_barFrame.anchor.y = 0.5;
		this.quickTimeEventLayer.addChild(this.qte_barFrame)
		this.qte_pointing = new Sprite();
		this.qte_pointing.bitmap = ImageManager.loadSystem("qtePointing")
		this.qte_pointing.x = px
		this.qte_pointing.y = py
		this.qte_pointing.anchor.x = this.qte_pointing.anchor.y = 0.5;
		this.quickTimeEventLayer.addChild(this.qte_pointing)
		this.qte_timer = new Sprite_QTETimer();
		[this.qte_timer.x, this.qte_timer.y] = _.na2;
		this.quickTimeEventLayer.addChild(this.qte_timer);
	}

	Spriteset_Base.prototype.showQteParts = function() {
		const px = Graphics.width/2 + _.na1[0];
		const bb = ImageManager.loadSystem("qteHitArea");
		const bbw = bb.width;
		const bbh = bb.height;
		const hw = bbw * $gameVariables.value(_.n4).clamp(0,100) / 100;
		const barWidth = bbw - _.n1;
		this.qte_pointing.x = px - barWidth/2 + Math.round(Math.random()*barWidth);
		this.qte_verocity = Math.random() < 0.5 ? $gameVariables.value(_.n5) : -$gameVariables.value(_.n5);
		this.qte_bar.bitmap.blt(bb, 0, 0, bbw, bbh, (bbw - hw)/2, 0, hw, bbh+1);
		this.hitRangeWidth = hw;
		this.quickTimeEventLayer.visible = true;
		this.qte_timer.setTimer();
	}

	Spriteset_Base.prototype.hideQteParts = function() {
		this.quickTimeEventLayer.visible = false;
		$gameTemp.qteGameFaseNumber = -1;
	}
	
	Spriteset_Base.prototype.startQteProc = function() {
		$gameTemp.qteGameFaseNumber = 0;
		this.qte_timer.startTimer();
	}
	
	const _alias_Spriteset_Base_update = Spriteset_Base.prototype.update;
	Spriteset_Base.prototype.update = function() {
		_alias_Spriteset_Base_update.call(this);
		this.updateQte();
	}
	
	Spriteset_Base.prototype.updateQte = function() {
		if(typeof $gameTemp.qteGameFaseNumber === "undefind" || $gameTemp.qteGameFaseNumber < 0){
			return;
		}
		const px = Graphics.width/2 + _.na1[0];
		if($gameTemp.qteGameFaseNumber == 0){
			if(Input.isTriggered("ok") || TouchInput.isTriggered()){
				const inRange = px - this.hitRangeWidth/2 <= this.qte_pointing.x && this.qte_pointing.x <= px + this.hitRangeWidth/2;
				$gameSwitches.setValue(_.n2, inRange);
				const audio = inRange ? _.audio1 : _.audio2;
				AudioManager.playSe(audio);
				$gameTemp.qteGameFaseNumber = -1;
				Input.update();
				//23/06/15 ボタン押下の際に少し進んでしまう不具合の修正
				return;
			}
			if(this.qte_timer.isTimeup()){
				$gameSwitches.setValue(_.n2, false);
				$gameTemp.qteGameFaseNumber = -1;
			}
		}
		const bbw = ImageManager.loadSystem("qteFrame").width;
		const barWidth = bbw - _.n1;
		this.qte_pointing.x += this.qte_verocity;
		if(px + barWidth/2 <= this.qte_pointing.x){
			this.qte_verocity *= -1;
			this.qte_pointing.x = px + barWidth/2;
		} else if(this.qte_pointing.x <= px - barWidth/2){
			this.qte_verocity *= -1;
			this.qte_pointing.x = px - barWidth/2;
		}
		this.qte_timer.update();
	}
	
	//-----------------------------------------------------------------------------
	// Spriteset_Map
	//

	const _alias_Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
	Spriteset_Map.prototype.createLowerLayer = function() {
		_alias_Spriteset_Map_createLowerLayer.call(this);
		this.createQuickTimeEventParts(this);
	}

	//-----------------------------------------------------------------------------
	// Spriteset_Battle
	//

	const _alias_Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
	Spriteset_Battle.prototype.createLowerLayer = function() {
		_alias_Spriteset_Battle_createLowerLayer.call(this);
		this.createQuickTimeEventParts(this);
	}

	//-----------------------------------------------------------------------------
	// Sprite_QTETimer
	//

	function Sprite_QTETimer() {
		this.initialize(...arguments);
	}

	Sprite_QTETimer.prototype = Object.create(Sprite_Timer.prototype);
	Sprite_QTETimer.prototype.constructor = Sprite_QTETimer;

	Sprite_QTETimer.prototype.initialize = function() {
		Sprite_Timer.prototype.initialize.call(this);
		this.visible = true;
		this.update();
	};

	Sprite_QTETimer.prototype.setTimer = function() {
		this._seconds = $gameVariables.value(_.n3)*1000
		this.drawSecond(this._seconds)
	}

	Sprite_QTETimer.prototype.startTimer = function() {
		this._startTime = Date.now();
	}
	
	Sprite_QTETimer.prototype.isTimeup = function() {
		const currentTime = Date.now();
		return Math.max(this._seconds - (currentTime - this._startTime), 0) <= 0;
	}
	
	Sprite_QTETimer.prototype.redraw = function() {
		const currentTime = Date.now();
		const remainingTime = Math.max(this._seconds - (currentTime - this._startTime), 0);
		this.drawSecond(remainingTime)
	};
	
	Sprite_QTETimer.prototype.drawSecond = function(remainingTime) {
		const remainingSeconds = Math.floor(remainingTime / 1000);
		const remainingMilliseconds = Math.floor(remainingTime % 1000 / 10);
		const width = this.bitmap.width;
		const height = this.bitmap.height;
		this.bitmap.clear();
		this.bitmap.drawText(remainingSeconds + ":" + remainingMilliseconds.padZero(2), 0, 0, width, height, "center");
	}
	
	Sprite_QTETimer.prototype.updateBitmap = function() {
		if($gameTemp.qteGameFaseNumber < 0){return}
		this.redraw();
	};

	Sprite_QTETimer.prototype.updateVisibility = function() {
	};

	Sprite_QTETimer.prototype.updatePosition = function() {
	}

}






































