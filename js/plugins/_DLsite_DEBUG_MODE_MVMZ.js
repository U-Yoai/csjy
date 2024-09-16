//=============================================================================
// _DEBUG_MODE_MVMZ.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc デバッグモード（MV/MZ両対応）
 * @author DLsite
 * 
 * @param GetAllItems
 * @desc アイテムを全て入手するコマンドを表示
 * @default true
 * @type boolean
 * 
 * @param GetAllSkills
 * @desc スキルを全て習得するコマンドを表示
 * @default true
 * @type boolean
 * 
 * @param LevelMax
 * @desc レベルを最大値にするコマンドを表示
 * @default true
 * @type boolean
 *
 * @param ShowMapIDKey
 * @desc 現在のマップIDとマップ名を画面右下に表示するためのキー
 * @default F8
 * @option F1
 * @option F2
 * @option F3
 * @option F4
 * @option F5
 * @option F6
 * @option F7
 * @option F8
 * @option F9
 * @option F10
 * @option F11
 * @option F12
 * @type select
 *
 * @param ScreenShotKey
 * @desc スクリーンショットキー
 * @default F1
 * @option F1
 * @option F2
 * @option F3
 * @option F4
 * @option F5
 * @option F6
 * @option F7
 * @option F8
 * @option F9
 * @option F10
 * @option F11
 * @option F12
 * @type select
 *
 * @help デプロイメントしたデータでもデバッグ起動を可能にします。
 * 以下の機能があります
 * ・Ctrlキーで壁のすり抜け & エンカウント停止（デフォルトの仕様の場合）
 * ・「F9」でゲーム内フラグを変更
 *      - アイテム全入手、スキル全習得などの機能追加
 *      - プラグインによっては「スキル全習得」すると
 *        エラーが発生する場合があるので、
 *        その場合は該当項目をfalseにして下さい。選択できなくなります。
 */

(() => {
    'use strict';

    const getBooleanParam = function(param) {
        return param === "true";
    };
    
    //パラメータ名を取得し、該当するパラメーター値を取得
    const getParamString = function(paramNames) {
    	var value = '';
    	for (const paramName of paramNames){
        	value = PluginManager.parameters('_DLsite_DEBUG_MODE_MVMZ')[paramName];
        	console.log("value = " + value);
        }
        
        return value == null ? '' : String(value);
    };
    

    const PARAMETERS = PluginManager.parameters('_DLsite_DEBUG_MODE_MVMZ');
    const GET_ALL_ITEM = getBooleanParam(PARAMETERS['GetAllItems']);
    const GET_ALL_SKILLS = getBooleanParam(PARAMETERS['GetAllSkills']);
    const LEVEL_MAX = getBooleanParam(PARAMETERS['LevelMax']);
    const ADDED_PARAM_NUM = 4;
    
    var GET_SHOW_MAPID_KEY = getParamString(['ShowMapIDKey']);
    var GET_SCREENSHOT_KEY = getParamString(['ScreenShotKey']);
    
    //マップ情報
    const nowMapInfo = {
    	
    	mapID: "Unknown",
    	mapName: "Unknown"
    	
    };
    
    //キーマッピング
    Input.functionReverseMapper = {
        F1 : 112,
        F2 : 113,
        F3 : 114,
        F4 : 115,
        F5 : 116,
        F6 : 117,
        F7 : 118,
        F8 : 119,
        F9 : 120,
        F10: 121,
        F11: 122,
        F12: 123
    };
    
    //シーン開始
    var _oldStart = Scene_Base.prototype.start;
    
    //スプライト
    var _mapIDSprite = null;
    
    var _debugSprite = null;
    
    //マップID表示切替フラグ
    var showMapID = false;
    var enableDebugWindow = false;
    
    //呼び出しイベントID
    var _mapEventID = 0;
    var _comEventID = 0;
    var _pageIndex = 0;
    
    //コモンイベント情報
    var _comEventInfo = {
    	
    	id: 0,
    	name: ""
    	
    };
    
    //コモンイベント情報配列
    var _comEventList = [];
    
    this._window = null;
    let self = this;
    
    function BaseDebugMethod(){
    	return console.log('BaseDebugMethod');
    }

    //--------------------------------------------
    //Notice_On_Title
    //--------------------------------------------
    const _Scene_Title_createForeground = Scene_Title.prototype.createForeground;
    Scene_Title.prototype.createForeground = function() {
        _Scene_Title_createForeground.call(this);
        this.showNotice();
    };
    
    Scene_Title.prototype.showNotice = function() {
        const noticeText = "DEBUG MODE ON";
        const noticeFontSize = 40;
        const noticeColor = '#00FF00';
        const y = Graphics.height - noticeFontSize;
        this._customSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this._customSprite.bitmap.fontSize = noticeFontSize;
        this._customSprite.bitmap.textColor = noticeColor;
        this._customSprite.bitmap.drawText(noticeText, 0, y, Graphics.width, noticeFontSize, 'right');
        this.addChild(this._customSprite);
        console.log("$dataSystem = " + $dataSystem.switches.length);
     };

    //--------------------------------------------
    //Game_Temp
    //--------------------------------------------
    Game_Temp.prototype.isPlaytest = function() {
        return true;
    };

    //--------------------------------------------
    //Scene_Debug
    //--------------------------------------------
    const _Scene_Debug_onRangeOk = Scene_Debug.prototype.onRangeOk;
    Scene_Debug.prototype.onRangeOk = function() {
        if (this._rangeWindow._isCheatIndex()) {
            this._exeCheat();
            this._rangeWindow.activate();
        } else {
            _Scene_Debug_onRangeOk.call(this);
        }
    };

    const _Scene_Debug_refreshHelpWindow = Scene_Debug.prototype.refreshHelpWindow;
    Scene_Debug.prototype.refreshHelpWindow = function() {
        _Scene_Debug_refreshHelpWindow.call(this);
        if (this._rangeWindow._isCheatIndex()){
            const cheatIndex = this._rangeWindow._cheatIndex();
            const text = this._rangeWindow._getCheatInfo(cheatIndex)[3];
            this._debugHelpWindow.drawText(text, 4, 0);
            console.log("text = ",text);
        }
    };

    Scene_Debug.prototype._exeCheat = function() {
        const cheatIndex = this._rangeWindow._cheatIndex();
        const command = this._rangeWindow._getCheatInfo(cheatIndex)[2];
        switch(command) {
            case "ITEM":
                this._getAllItems();
                break;
            case "SKILL":
                this._getAllSkills();
                break;
            case "LEVEL":
                this._levelMax();
                break;
            case "MAPID":
            	this._mapID();
            default:
                return;
        }
        
        console.log("_exeCheat");
        this.refreshHelpWindow();
    };

    Scene_Debug.prototype._getAllItems = function() {
        const n = 99;
        for (let i = 1; i < $dataItems.length; i++) {
        	console.log("$dataItems[i].name = " + $dataItems[i].name);
            if ($dataItems[i].name !== "") {
                $gameParty.gainItem($dataItems[i], n);
            }
        }
        for (let i = 1; i < $dataWeapons.length; i++) {
        	
        	if(!$dataWeapons[i]) continue;
            if($dataWeapons[i].name == null) continue;
            
            if ($dataWeapons[i].name !== "") {
                $gameParty.gainItem($dataWeapons[i], n);
            }
        }
        for (let i = 1; i < $dataArmors.length; i++) {
            if ($dataArmors[i].name !== "") {
                $gameParty.gainItem($dataArmors[i], n);
            }
        }
        $gameParty.gainGold(99999999);
    };

    Scene_Debug.prototype._getAllSkills = function() {
        for (let i = 1; i < $dataSkills.length; i++) {
            if ($dataSkills[i].name !== "") {
                $gameParty.members().forEach(function(actor) {
                    actor.learnSkill(i);
                });
            }
        }
    };

    Scene_Debug.prototype._levelMax = function() {
        $gameParty.members().forEach(function(actor) {
            actor.changeLevel(99, false);
        });
    };
    
    //マップIDとマップ名を取得
    Scene_Debug.prototype._mapID = function(){
    	var mapInfo = $dataMapInfos[$gameMap.mapId()];
    	
    	if(mapInfo){
    		nowMapInfo.mapID = mapInfo.id;
    		nowMapInfo.mapName = mapInfo.name;
    	}
    	
    	console.log('mapID = ',nowMapInfo.mapID);
    	console.log('mapName = ',nowMapInfo.mapName);
    	
    }
    
    //デバッグログ描画処理
    Scene_Debug.prototype._ShowMapID = function(mapInfo) {
    	
    	 var _drawY = -50;
    	
    	//マップIDとマップ名を描画
        _mapIDSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        _mapIDSprite.bitmap.fontSize = 20;
        _mapIDSprite.bitmap.textColor = '#FFFFFF';
        _mapIDSprite.bitmap.drawText("MapID:" + nowMapInfo.mapID, 0, 0, Graphics.width, (Graphics.height * 2 - 60) - 110, 'right');
        _mapIDSprite.bitmap.drawText("マップ名:" + nowMapInfo.mapName, 0, 30, Graphics.width, (Graphics.height * 2 - 60) - 110, 'right');
        
        //マップイベントIDとコモンイベント情報を描画
        /*_mapIDSprite.bitmap.fontSize = 20;
        
        _mapIDSprite.bitmap.drawText("MapEventID:" + _mapEventID, 0, 0, Graphics.width, (Graphics.height / 2) - 220, 'left');
        
        if(_comEventList.length <= 0){
        	console.log("_comEventList.length is 0");
        	_mapIDSprite.bitmap.drawText("COMID:null", 0, 0, Graphics.width, (Graphics.height / 2) - 170, 'left');
        }else{
        	_drawY = _drawY + 40;
        	_mapIDSprite.bitmap.drawText("COMID:" + _comEventList[0].id + " " + _comEventList[0].name, 0, _drawY, Graphics.width, (Graphics.height / 2) - 150 - _drawY, 'left');
        	
        	for(var i = 1; i < _comEventList.length; i++){
        		_drawY = _drawY + 40;
        		_mapIDSprite.bitmap.drawText(_comEventList[i].id + " " + _comEventList[i].name, 60, _drawY, Graphics.width, (Graphics.height / 2) - 150 - _drawY, 'left');
        	}
        }*/
        
        SceneManager._scene.addChild(_mapIDSprite);
    }
    
    //スプライトの削除
    Scene_Debug.prototype._DeleteMapID = function() {
    	SceneManager._scene.removeChild(_mapIDSprite);
    	_mapIDSprite = null;
    	console.log("_mapIDSprite = " + _mapIDSprite);
    }
    
    //現在シーンの判別
    SceneManager.onSceneCreated = function(){
    	
    	//初期化中である場合
    	if(SceneManager._scene instanceof Scene_Boot){
    		console.log("Now_Boot_Scene");
    		return false;
    	}
    	
    	console.log("Not_Boot_Scene");
    	return true;
    }
    
    //シーン開始時、マップID、名前表示がONの場合、書き換え
    Scene_Base.prototype.start = function(){
    	_oldStart.call(this);
    	
    	console.log("Now_Scene = " + SceneManager.onSceneCreated());
    	console.log("shoMapID = " + showMapID);
    	
    	//表示中かつ初期化中でない場合、ログ表示
    	if(showMapID && SceneManager.onSceneCreated()){
    		Scene_Debug.prototype._mapID();
    		Scene_Debug.prototype._DeleteMapID();
    		Scene_Debug.prototype._ShowMapID(nowMapInfo);
    		console.log("_mapIDSprite");
    	}
    	
    	console.log("Scene_Debug.prototype.start");
    	console.log("GET_SHOW_MAPID_KEY = " + GET_SHOW_MAPID_KEY);
    	console.log("GET_SCREENSHOT_KEY = " + GET_SCREENSHOT_KEY);
    	
    }
    
    //キーマッピングから表示/非表示ボタンのキーコードを取得
    var ConvertKeyNameToKeyCode = function(){
    	
    	var keyCode = 0;
    	var keyMap = Input.functionReverseMapper;
    	var nowkeyMap = 0;
    	var keyMapList = [];
    	
    	if(keyMap.hasOwnProperty(GET_SHOW_MAPID_KEY)){
    		keyMapList[0] = keyMap[GET_SHOW_MAPID_KEY];
    		//return keyMap[GET_SHOW_MAPID_KEY];
    	}else{
    		return 0;
    	}
    	
    	if(keyMap.hasOwnProperty(GET_SCREENSHOT_KEY)){
    		keyMapList[1] = keyMap[GET_SCREENSHOT_KEY];
    		//return keyMap[GET_SCREENSHOT_KEY];
    	}else{
    		return 0;
    	}
    	
    	console.log("keyMapList = " + keyMapList);
    	
    	return keyMapList;
    }
    
    //デバッグツール・マップID・スクリーンショットのイベントを追加
    document.addEventListener('keydown', function(event) {
    	
    	console.log("event.keyCode = " + event.keyCode);
    	console.log("ConvertKeyNameToKeyCode = " + ConvertKeyNameToKeyCode());
    	console.log("showMapID = " + showMapID);
    	//Bitmap.prototype.decode();
    	
    	var KeyNameToKeyCode = ConvertKeyNameToKeyCode();
    	
    	if(event.keyCode == KeyNameToKeyCode[0] && !showMapID){
    		Scene_Debug.prototype._mapID();
    		Scene_Debug.prototype._ShowMapID(nowMapInfo);
    		BaseHTML_Create();
    		CreateCustomWindow();
    		console.log("pressed " + GET_SHOW_MAPID_KEY);
    		showMapID = true;
    	}else if (event.keyCode == KeyNameToKeyCode && showMapID){
    		Scene_Debug.prototype._DeleteMapID();
    		BaseDebugMethod.CloseWindow();
    		showMapID = false;
    		console.log("delete_MapID");
    	}else if (event.keyCode == KeyNameToKeyCode[1]){
    		BaseDebugMethod.TakeScreenShot();
    		console.log("pressed " + GET_SCREENSHOT_KEY);
    	}
    	
    });
    
    window.addEventListener('beforeunload', function(event) {
    	event.preventDefault();
    	BaseDebugMethod.CloseWindow();
    	event.returnValue = 'ゲームを終了しますか？';
    	
    });
    
    //--------------------------------------------
    //BaseHTML Create
    //--------------------------------------------
    function BaseHTML_Create(){
    	const fs = require('fs');
    	
		fs.writeFileSync('DLsite_DebugTools.html',BaseHTML(BaseDebugMethod.getMapList,BaseDebugMethod.DrawEvent),'utf8');
		console.log("BaseHTML_Create");
		
    }
    
    function BaseHTML(getMapList){
    	return `<!DOCTYPE html><html><head><title></title></head><body></body></html>`;
    }
    
     //--------------------------------------------
    //シーン移動
    //--------------------------------------------
    BaseDebugMethod.PlayerTranslate = function(){
    	var mapId = self._window.window.document.getElementById('mapId').value;
    	console.log("Translate_mapID = " + mapId);
    	$gamePlayer.reserveTransfer(parseInt(mapId), 8, 6, 0, 2);
    }
    
    //--------------------------------------------
    //レベルセット
    //--------------------------------------------
    BaseDebugMethod.ChangeLevel = function(){
    	var level = parseInt(self._window.window.document.getElementById('levelId').value);
    	console.log("level = " + level);
    	$gameParty.members().forEach(function(actor){
    		actor.changeLevel(level, false);
    	});
    }
    
    //--------------------------------------------
    //経験値セット
    //--------------------------------------------
    BaseDebugMethod.AddExp = function(){
    	var exp = self._window.window.document.getElementById('expId').value;
    	$gameParty.members().forEach(function(actor){
    		actor.gainExp(exp);
    		while(actor.isMaxLevel() == false && actor.isLearnings()){
    			actor.levelUp();
    		}
    	});
    }
    
    //--------------------------------------------
    //スキル全取得
    //--------------------------------------------
    BaseDebugMethod.AddSkills = function(){
    	//var exp = self._window.window.document.getElementById('expId').value;
    	for (let i = 1; i < $dataSkills.length; i++) {
            if ($dataSkills[i].name !== "") {
                $gameParty.members().forEach(function(actor) {
                    actor.learnSkill(i);
                });
            }
        }
    }
    
    //--------------------------------------------
    //アイテム全取得
    //--------------------------------------------
    BaseDebugMethod.AddItems = function(){
    	Scene_Debug.prototype._getAllItems();
    }
    
    //--------------------------------------------
    //アイテム各取得
    //--------------------------------------------
    BaseDebugMethod.AddItem = function(){
    	var ItemId = self._window.window.document.getElementById('itemId').value
        console.log("ItemId = " + ItemId);
        $gameParty.gainItem($dataItems[ItemId], 99);
        console.log("アイテム各取得");
            
        /*for (let i = 1; i < $dataWeapons.length; i++) {
        	
        	if(!$dataWeapons[i]) continue;
            if($dataWeapons[i].name == null) continue;
            
            if ($dataWeapons[i].name !== "") {
                $gameParty.gainItem($dataWeapons[i], n);
            }
        }
        for (let i = 1; i < $dataArmors.length; i++) {
            if ($dataArmors[i].name !== "") {
                $gameParty.gainItem($dataArmors[i], n);
            }
        }*/
        
        //$gameParty.gainGold(99999999);
        
    }
    
    //--------------------------------------------
    //スクリーンショット
    //--------------------------------------------
    const gui = require('nw.gui');
    BaseDebugMethod.TakeScreenShot = function(){
    	
    	
    	var bitmap = SceneManager.snap();
    	var canvas = document.createElement('canvas');
    	canvas.width = Graphics.width;
    	canvas.height = Graphics.height;
    	var ctx = canvas.getContext('2d');
    	
    	//console.log("bitmap.gl = " + canvas.getContext('experimental-webgl'));
    	
    	ctx.drawImage(bitmap._canvas,0,0);
    	
    	
    	
    	//console.log("title = " + SceneManager.snap());
    	var link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'WindowScreenshot_' + new Date().toISOString().slice(0, 19).replace(/[-T:/]/g, '') + '.jpg';
        var fs = require('fs');
    //var desktopPath = require('path').join(require('os').homedir(), 'Desktop');
    //var filePath = require('path').join(desktopPath, link.download);
    
   //const dialog = require('fs');
    
    var win = gui.Window.get();
    var fileDialog = document.createElement('input');
    
    fileDialog.type = 'file';
    fileDialog.nwsaveas = 'WindowScreenshot_' + new Date().toISOString().slice(0, 19).replace(/[-T:/]/g, '') + '.jpg'; // デフォルトの保存ファイル名
    fileDialog.style.display = 'none';
	
	
	
    fileDialog.addEventListener('change', function(event) {
        var filePath = this.value;
        if (filePath) {
            fs.writeFile(filePath, canvas.toDataURL().split(',')[1], 'base64', function(err) {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully:', filePath);
        }
    });
        } else {
            console.log('No file selected.');
        }
    });

    win.window.document.body.appendChild(fileDialog);
    fileDialog.click(); // ファイルダイアログを開きます
    
    // ファイルを書き込みます
    /*fs.writeFile(filePath, canvas.toDataURL().split(',')[1], 'base64', function(err) {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully:', filePath);
        }
    });*/
        //link.click();
        
    //Scene_Debug.prototype._ShowMapID(nowMapInfo);
    	
    }
    
    //--------------------------------------------
    //マップID表示/非表示
    //--------------------------------------------
    BaseDebugMethod.setDeleteMapID = function(){
    	Scene_Debug.prototype._DeleteMapID();
    }
    
    BaseDebugMethod.setActiveMapID = function(){
    	Scene_Debug.prototype._ShowMapID(nowMapInfo);
    }
    
    //--------------------------------------------
    //ロードエラーすり抜け
    //--------------------------------------------
    //画像リクエスト時に画像が無い場合のハンドラを書き換え、エラーすり抜け
    Bitmap.prototype._requestImage = function(url) {
        if (Bitmap._reuseImages.length !== 0) {
            this._image = Bitmap._reuseImages.pop();
        } else {
            this._image = new Image();
        }

        if (this._decodeAfterRequest && !this._loader) {
            this._loader = ResourceHandler.createLoader(url, this._requestImage.bind(this, url), this._onError.bind(this));
        }

        this._url = url;
        this._loadingState = 'requesting';

        if (!Decrypter.checkImgIgnore(url) && Decrypter.hasEncryptedImages) {
            this._loadingState = 'decrypting';
            Decrypter.decryptImg(url, this);
        } else {
            this._image.src = url;
            
            console.log("this._image.src = " + this._image.src);

            this._image.addEventListener('load', this._loadListener = Bitmap.prototype._onLoad.bind(this));
            this._image.addEventListener('error', this._errorListener = this._onError.bind(this));
            
        }
        
    };

    // エラーハンドラの追加
    Bitmap.prototype._onError = function() {
        console.log("Failed to load image: " + this._url); // エラーメッセージの表示
        this._hasError = false; // エラーフラグを設定しない
        this._loadingState = 'loaded'; // ロードステータスを変更
    };
    
    WebAudio.prototype._load = function(url) {
        if (WebAudio._context) {
            var xhr = new XMLHttpRequest();
            if (Decrypter.hasEncryptedAudio) url = Decrypter.extToEncryptExt(url);
            console.log("url = " + url);
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                if (xhr.status < 400) {
                    console.log("xhr.status = " + xhr.status);
                    this._onXhrLoad(xhr);
                }
            }.bind(this);
            
            xhr.onerror = function(){
            	console.log('Failed to load audio: ' + url); // エラーメッセージのログ出力
            }
            
            xhr.send();
        }
    };
    
    //--------------------------------------------
    //CreateWindow
    //--------------------------------------------
    function CreateCustomWindow(){
    	//console.log("gui = " + gui);
    	gui.Window.open('DLsite_DebugTools.html',{
			title: "Test_nw_gui",
			width: 600,
			height: 680,
			resizable: false,
			icon: "www/icon/icon.png"
		}, function(newWindow) {
			self._window = newWindow;
			
			self._window.setShowInTaskbar(false);
			
			self._window.on('loaded',function() {
				enableDebugWindow = true;
				self._window.window.BaseDebugMethod = BaseDebugMethod;
				BaseDebugMethod.TestTitleWrite();
				var mapList = BaseDebugMethod.getMapList();
				var levelhtml = BaseDebugMethod.changeLevel();
				var exphtml = BaseDebugMethod.changeExp();
				var sklhtml = BaseDebugMethod.getSkills();
				var itemhtml = BaseDebugMethod.getItems();
				var itemhtml2 = BaseDebugMethod.getItem();
				var scrhtml = BaseDebugMethod.getScreenShot();
				var maphtml = BaseDebugMethod.setMapID();
				var switchHtml = BaseDebugMethod.getSwitces();
				BaseDebugMethod.HTMLAddWrite(mapList);
				BaseDebugMethod.HTMLAddWrite(levelhtml);
				BaseDebugMethod.HTMLAddWrite(exphtml);
				BaseDebugMethod.HTMLAddWrite(sklhtml);
				BaseDebugMethod.HTMLAddWrite(itemhtml);
				BaseDebugMethod.HTMLAddWrite(itemhtml2);
				BaseDebugMethod.HTMLAddWrite(scrhtml);
				BaseDebugMethod.HTMLAddWrite(maphtml);
				BaseDebugMethod.HTMLAddWrite("<hr>");
				BaseDebugMethod.HTMLAddWrite(switchHtml);
				BaseDebugMethod.SetSwitcesTable();
				BaseDebugMethod.SetVariableTable();
				//BaseDebugMethod.HTMLAddWrite(BaseDebugMethod.DrawEventInfo());
				
			});
			
		}.bind(this));
		
		var win = gui.Window.get();
                win.showDevTools();
    }
    
    BaseDebugMethod.TestTitleWrite = function(){
    	self._window.window.document.body.innerHTML = "<h1>Hellow RPGツクールMV!</h1>";
    }
    
    BaseDebugMethod.HTMLAddWrite = function(code){
    	self._window.window.document.body.innerHTML += code;
    }
    
    BaseDebugMethod.HTML_EveID_ReWrite = function(code,id){
    	self._window.window.document.getElementById(id).innerHTML = '<p id=' + id + '>EventID = ' + code + '</p>';
    }
    
    /*BaseDebugMethod.DrawMapInfo = function(){
    	
    	let draw_mapInfo = '<p id="MapID">MapID = ' + _mapEventID + '</p>' + 
    						'<p id="MapName">MapName = ' + nowMapInfo.mapName + '</p>';
    	
    	
    	return draw_mapInfo;
    }*/
    
    BaseDebugMethod.DrawEventInfo = function(){
    	let draw_EventInfo = '<p id="EventID">EventID = ' + _comEventID + '</p>' + 
    							'<p id="EventName">EventName = ' + null + '</p>';
    	return draw_EventInfo;
    }
    
    BaseDebugMethod.UpDateLog = function(){
    	
    	var doc = self._window.window.document;
    	var lenght = doc.querySelectorAll('[id^="EventName"]').length;
    	
    	//初期化
    	if(doc.getElementById('EventName') != null){
    		doc.getElementById('EventName').remove();
    		doc.getElementById('EventID').remove();
    	}
    	
    	doc.body.innerHTML += '<p id="EventID">EventID = ' + _mapEventID + '</p>';
    	
    	if(_comEventList[0]){
    	
    		doc.body.innerHTML += '<p id="EventName">EventName = ' + _comEventList[0].name + '</p>';
    	
    	}
    	
    	if(doc.getElementById('EventName1')){
    	
    		for(var i = 1; i < lenght; i++){
    			//console.log("i = " + i);
    			if(!(doc.getElementById('EventName' + i))){
    				console.log("return");
    				return;
    			}else{
    				doc.getElementById('EventName' + i).remove();
    			}
    		}
    	}
    }
    
    BaseDebugMethod.getMapList = function(){
    	let result = `<hr>シーン移動<br><select id="mapId" style="width:100%" onchange="BaseDebugMethod.PlayerTranslate()">`;
		for(let i = 1; i < $dataMapInfos.length; i++) {
			const info = $dataMapInfos[i];
			if(!info) continue;
			result += '<option id="mapId" value="' + info.id + '">' + info.name + '</option>';
		}
		console.log("result = " + result);
		result += `</select><br>`;
		return result;
    }
    
    BaseDebugMethod.changeLevel = function(){
    	let result = '<hr>レベルセット(直接レベルだけを書き換えます)<br><input type="number" id="levelId" name="levelId" min="1" max="9999" step="1" value="1"><button class="submit" onclick="BaseDebugMethod.ChangeLevel()">Set Level</button>';
    	return result;
    }
    
    BaseDebugMethod.changeExp = function(){
    	let result = '<hr>経験値セット(1～99999999)<br><input type="number" id="expId" name="expId" min="1" max="99999999" step="1" value="1"><button class="submit" onclick="BaseDebugMethod.AddExp()">Set Exp</button>';
    	return result;
    }
    
    BaseDebugMethod.getSkills = function(){
    	let result = '<hr>スキル全取得<br><button class="submit" onclick="BaseDebugMethod.AddSkills()">Get Skills</button>';
    	return result;
    }
    
    BaseDebugMethod.getItems = function(){
    	let result = '<hr>アイテム全取得<br><button class="submit" onclick="BaseDebugMethod.AddItems()">Get Items</button>';
    	return result;
    }
    
    BaseDebugMethod.getItem = function(){
    	let result = '<hr>アイテム取得</hr><br>';
    	result += '<select id="itemId" style="width:100%">';
    	for(let i = 1; i < $dataItems.length; i++) {
			const info = $dataItems[i].name;
			var infoNum = i;
			if(!info) continue;
			result += '<option id="itemId" value="' + infoNum + '">' + info + '</option>';
			console.log("info = " + info);
		}
		
		result += `</select><br>`;
		result += '<button class="submit" onclick="BaseDebugMethod.AddItem()">Get Item</button>';
		return result;
    }
    
    BaseDebugMethod.getScreenShot = function(){
    	let result = '<hr>スクリーンショット撮影<br><button class="submit" onclick="BaseDebugMethod.TakeScreenShot()">スクリーンショットを撮る</button>';
    	return result;
    }
    
    BaseDebugMethod.setMapID = function(){
    	let result = '<hr>マップIDのON/OFF<br><button class="submit" onclick="BaseDebugMethod.setDeleteMapID()">MapIDオフ</button><button class="submit" onclick="BaseDebugMethod.setActiveMapID()">MapIDオン</button>';
    	return result;
    }
    
    BaseDebugMethod.getSwitces = function() {
    	
    	let result = '<details><summary>フラグ操作</summary>';
		result += `<p>
					<div style="float: ;left; width: 47%; text-align:center;">
						<table id="Col1"></table>
					</div>
					<div style="float: left; width: 47%; text-align:center;">
						<table id="Col2"></table>
					</div>`;
		result += '</p></details>';
		
		console.log("result = " + result);
		
		return result;
	}
    
    BaseDebugMethod.SetSwitcesTable = function() {
    	let result1 = '';
		let result2 = '';
		const first = (this._listIndex * 40) + 1;
		console.log("$dataSystem = " + $dataSystem.switches.length);
    	for(let i = 0; i <= $dataSystem.switches.length; i++) {
		const value = $gameSwitches.value(i);
		const str = $dataSystem.switches[i];
		
		console.log("$dataSystem = " + $dataSystem.switches.length);
		
		result1 += `<tr>
						<td style="padding: 1px;width: 5%;"><input type="checkbox" onchange="DebugManager.changeSwitch(${i})" id="Switch ${i}" ${value ? 'checked' : ''}></td>
						<td style="padding: 1px;width: 35%; border: 1px solid #000">${str}</td>
					</tr>`;
		}
		
		console.log("result1 = " + result1);
		self._window.window.document.getElementById('Col1').innerHTML = result1;
    }
    
    BaseDebugMethod.SetVariableTable = function() {
    	let result = '';
		
		const first = (this._listIndex * 40) + 1;
		console.log("$dataSystem.variables = " + $dataSystem.variables.length);
    	
    	for(let i = 0; i <= $dataSystem.variables.length; i++) {
		
		const value = $gameVariables.value(i);
		const str = $dataSystem.variables[i];
		
		console.log("$dataSystem = " + $dataSystem.switches.length);
		
		result += `<tr>
						<td style="padding: 2px;width: 10%;"><input type="text" style="width: 50%;" onchange="DebugManager.changeVariable(${i})" id="Variable ${i}" value="${value}"></td>
					</tr>`;
		}
		
		console.log("result = " + result);
		self._window.window.document.getElementById('Col2').innerHTML = result;
    }
    
    BaseDebugMethod.CloseWindow = function(){
    	
    	gui.Window.get(self._window.window).close();
    	
    }
    
    //--------------------------------------------
    //Debug_Log
    //--------------------------------------------
    

    //--------------------------------------------
    //Window_DebugRange
    //--------------------------------------------
    Window_DebugRange.prototype.drawItem = function(index) {
        let rect;
        if (Utils.RPGMAKER_NAME === "MZ") {
            rect = this.itemLineRect(index);
        } else {
            rect = this.itemRectForText(index);
        }
        let start = 0;
        let end = 0;
        let text = "";
        let isEnabled = true;
        const setEnd = (start) => {
            return start + 9;
        };
        const setAddedText = (start, end) => {
            return ' [' + start.padZero(4) + '-' + end.padZero(4) + ']';
        };

        if (index < this._maxSwitches) {
            start = index * 10 + 1;
            end = setEnd(start);
            text = 'S' + setAddedText(start, end);
        } else if (index < this._maxSwitches + this._maxVariables) {
            start = (index - this._maxSwitches) * 10 + 1;
            end = setEnd(start);
            text = 'V' + setAddedText(start, end);
        } else {
            let info = this._getCheatInfo(index - this.maxItems() + ADDED_PARAM_NUM);
            text = info[0];
            isEnabled = info[1];
        }
        this.changePaintOpacity(isEnabled);
        this.drawText(text, rect.x, rect.y, rect.width);
    };

    Window_DebugRange.prototype.maxItems = function() {
        return this._maxSwitches + this._maxVariables + ADDED_PARAM_NUM;
    };

    Window_DebugRange.prototype.mode = function() {
        if (this._isCheatIndex()) {
            return 'cheat';
        }
        return this.index() < this._maxSwitches ? 'switch' : 'variable';
    };

    Window_DebugRange.prototype._cheatIndex = function() {
        return this.index() - this.maxItems() + ADDED_PARAM_NUM;
    };

    Window_DebugRange.prototype._isCheatIndex = function() {
        return this._cheatIndex() >= 0;
    };

    Window_DebugRange.prototype.isCurrentItemEnabled = function() {
        if (!this._isCheatIndex()) {
            return true;
        }
        return this._getCheatInfo(this._cheatIndex())[1];
    };

    Window_DebugRange.prototype._getCheatInfo = function(cheatIndex) {
        //["コマンド名", 選択可能かどうか, "シンボル", "実行メッセージ"]
        switch(cheatIndex) {
            case 0:
                return ["アイテム全入手", GET_ALL_ITEM, "ITEM", "アイテムを全て入手しました"];
            case 1:
                return ["スキル全習得", GET_ALL_SKILLS, "SKILL", "スキルを全て習得しました"];
            case 2:
                return ["レベルMAX", LEVEL_MAX, "LEVEL", "レベルを最大値にしました"];
            case 3:
            	return ["マップID表示", true, "MAPID", "MAPIDを表示します"];
        }
        return ["Dummy", false, "Dummy", "Dummy"];
    };
    
    //--------------------------------------------
    //Window_DebugEdit
    //--------------------------------------------
    Window_DebugEdit.prototype.refresh = function() {
        this.contents.clear();
        if (!(this._mode === 'cheat')) {
            this.drawAllItems();
        }
    };

})();