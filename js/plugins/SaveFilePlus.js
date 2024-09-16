// SaveFilePlus.js Ver.2.2.0
// MIT License (C) 2022 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MZ
* @plugindesc Make the save screen a little more gorgeous.
* @orderBefore SaveCharacterHasStepAnime
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/491066896.html
* @help Ver.2.2.0
*
* @param noData
* @text No Save Data
* @desc Text when there is no save data
* @default NO DATA
*
* @param dontPopScene
* @text Don't Pop Scene
* @desc Don't go back to the previous screen after saving.
* @type boolean
* @default false
*
* @param enableDimmer
* @text Enable Dim
* @desc Darken the background of the message displayed at the top of the screen when saving/loading.
* @default true
* @type boolean
*
* @param noSpace
* @text No Space
* @desc Compact the space in the touch UI area.
* @default false
* @type boolean
*
* @param partyCharacters
* @text Party Characters
* @desc Adjust the coordinates of the actor's graphics.
* @default {"offsetX":"8","offsetY":"0","distance":"48"}
* @type struct<partyCharacters>
*
* @param title
* @text File Title
* @desc Adjust the file title coordinates.
* @type struct<title>
* @default {"offsetX":"0","offsetY":"0"}
*
* @param icon
* @text Icon
* @desc A marker for the last used save data.
* @default {"id":"0","offsetX":"0","offsetY":"0"}
* @type struct<icon>
*
* @param numVisibleRows
* @text Number of Visible Rows
* @desc The number of lines displayed in the window.
* Disabled with -1.
* @default 4
*
* @param numSaveFiles
* @text Number of Save Files
* @desc Number of save files, excluding autosave.
* -1 for system standard.
* @type number
* @min -1
* @default -1
*
* @param levelInfo
* @text Level Information
* @desc Displays the actor's level above the character.
* @default {"enabled":"false","offsetX":"0","offsetY":"-76","width":"40","offsetFontSize":"-4"}
* @type struct<levelInfo>
*
* @param fesLayout
* @text Fes Style Layout
* @desc Makes the layout look like Maker Fes. The following parameters are available only when this parameter is enabled.
* @default true
* @type boolean
*
* @param titleDeco
* @text Title Decoration
* @desc Make changes to the file title.
* @type struct<titleDeco>
* @default {"deco":"false","disableTerms":"true","useNumberFont":"true","offsetFontSize":"-4","maxWidth":"180","offsetX":"0","offsetY":"0","offsetWidth":"6","offsetHeight":"12"}
*
* @param info1
* @text Information 1
* @desc Displays information such as current mapname, gold, play time, etc. along with item names.
* @default {"terms":"{\"mapname\":\"Map Name\",\"gold\":\"Gold\",\"playtime\":\"Play Time\",\"variable\":\"Variable\"}","dataList":"variable,mapname,gold,playtime","variableId":"","padding":"264","itemPadding":"8","itemNameWidth":"128","itemNameBackWidth":"192","itemNameAlign":"center"}
* @type struct<info1>
*
* @param info2
* @text Information 2
* @desc View other variables.
* @default {"variableId":"0","offsetX":"44","offsetY":"2","width":"212","align":"left","offsetX2":"70","offsetY2":"","width2":"186"}
* @type struct<info2>
*
*/

/*:ja
* @target MZ
* @plugindesc セーブ画面を若干豪華にします。
* @orderBefore SaveCharacterHasStepAnime
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/491066896.html
* @help 
*
* [更新履歴]
* 2022/08/28：Ver.1.0.0　公開。
* 2022/08/28：Ver.1.0.1　マップの設定で表示名を設定していなかった場合、名前を取得する仕様に変更。
* 2022/08/28：Ver.1.0.2　情報１のデータリストに登録されていないデータが保存されないように修正。
* 2022/09/07：Ver.1.0.3　情報１のパラメータを追加。
* 2022/09/18：Ver.1.0.4　情報１の初期値を修正。
* 2022/09/19：Ver.1.0.5　セーブファイル数を変えられるようにしました。
* 2022/12/12：Ver.2.0.0　歩行グラの間隔を調整可能に。レベル表記をより適切に。
* 2022/12/14：Ver.2.1.0　タイトル装飾のパラメータを強化。数字フォントに対応。よりツクールフェスに近づけることが可能に。
* 2022/12/14：Ver.2.1.1　タイトル装飾の最大幅を設定可能に。
* 2023/05/08：Ver.2.2.0　装飾の描画方法を修正。
*
* @param noData
* @text セーブデータなし
* @desc セーブデータがない時のテキスト
* @default NO DATA
*
* @param dontPopScene
* @text セーブ完了時に前の画面に戻さない
* @desc 普通はセーブ完了時に前の画面に戻りますがそれを戻らなくします。
* @type boolean
* @default false
*
* @param enableDimmer
* @text セーブメッセージ背景を暗くする
* @desc セーブ/ロード時に画面上方に表示されるメッセージの背景を暗くします。
* @default true
* @type boolean
*
* @param noSpace
* @text スペースなし
* @desc タッチUI領域のスペースを詰めます。
* @default false
* @type boolean
*
* @param partyCharacters
* @text パーティキャラクター
* @desc アクターの歩行グラの座標を調整します。
* @default {"offsetX":"8","offsetY":"0","distance":"48"}
* @type struct<partyCharacters>
*
* @param title
* @text ファイルタイトル
* @desc ファイルタイトルの座標を調整します。
* @type struct<title>
* @default {"offsetX":"0","offsetY":"0"}
*
* @param icon
* @text アイコン
* @desc 最後に使用したセーブデータのマーカーです。
* @default {"id":"0","offsetX":"0","offsetY":"0"}
* @type struct<icon>
*
* @param numVisibleRows
* @text 表示行数
* @desc ウィンドウ内に表示される行数です。-1で無効。
* 画面解像度や表示する項目数によって増減して下さい。
* @default 4
*
* @param numSaveFiles
* @text セーブファイル数
* @desc オートセーブを除いたセーブファイル数。
* -1でシステム標準。
* @type number
* @min -1
* @default -1
*
* @param levelInfo
* @text レベル情報
* @desc アクターのレベルをグラの上に表示します。
* @default {"enabled":"false","offsetX":"0","offsetY":"-76","width":"40","offsetFontSize":"-4"}
* @type struct<levelInfo>
*
* @param fesLayout
* @text フェス式レイアウト
* @desc レイアウトを大幅に改変し、ツクールフェス風にします。
* 以下のパラメータはこのパラメータ有効時のみ使用可能です。
* @default true
* @type boolean
*
* @param titleDeco
* @text タイトル装飾
* @desc ファイルタイトルに変更を加えます。
* @type struct<titleDeco>
* @default {"deco":"false","disableTerms":"true","useNumberFont":"true","offsetFontSize":"-4","maxWidth":"180","offsetX":"0","offsetY":"0","offsetWidth":"6","offsetHeight":"12"}
*
* @param info1
* @text 情報１
* @desc 現在地、所持金、プレイ時間などの情報を項目名と共に表示します。
* @default {"terms":"{\"mapname\":\"現在地\",\"gold\":\"所持金\",\"playtime\":\"プレイ時間\",\"variable\":\"変数\"}","dataList":"variable,mapname,gold,playtime","variableId":"","padding":"264","itemPadding":"8","itemNameWidth":"128","itemNameBackWidth":"192","itemNameAlign":"center"}
* @type struct<info1>
*
* @param info2
* @text 情報２
* @desc その他の変数を表示します。
* @default {"variableId":"0","offsetX":"44","offsetY":"2","width":"212","align":"left","offsetX2":"70","offsetY2":"","width2":"186"}
* @type struct<info2>
*
*/

/*~struct~terms:
*
* @param mapname
* @text Map Name
* @default Map Name
*
* @param gold
* @text Gold
* @default Gold
*
* @param playtime
* @text Play Time
* @default Play Time
*
* @param variable
* @text Variable
* @default Variable
*
*/

/*~struct~terms:ja
*
* @param mapname
* @text 現在地
* @default 現在地
*
* @param gold
* @text 所持金
* @default 所持金
*
* @param playtime
* @text プレイ時間
* @default プレイ時間
*
* @param variable
* @text 変数
* @default 変数
*
*/

/*~struct~info1:
*
* @param terms
* @text Terms
* @desc Set the title for each item.
* @default
* @type struct<terms>
*
* @param dataList
* @text Data List
* @desc Among the items displayed in the save data, the item that was inserted first is displayed at the top. Please delete unnecessary items.
* @default variable,mapname,gold,playtime
*
* @param variableId
* @text Variable
* @desc It can be used by setting the setting value to 1 or more and adding variable to the data list.
* @type variable
*
* @param padding
* @text Padding
* @desc Adjust the position of the information display.
* @type number
* @default 264
* @min -9999999
*
* @param itemPadding
* @text Item Padding
* @desc Adjust the position of the item content.
* @type number
* @default 8
* @min -9999999
*
* @param itemNameWidth
* @text Item Name Width
* @desc Adjust the width of item names.
* @type number
* @default 128
*
* @param itemNameBackWidth
* @text Item Name Background Width
* @desc Adjust the width of the item name background.
* @type number
* @default 192
*
* @param itemNameAlign
* @text Item Name Align
* @desc Align item names.
* @type select
* @option left
* @option center
* @option right
* @default center
*
*/

/*~struct~info1:ja
*
* @param terms
* @text 用語
* @desc 項目ごとのタイトルを設定します。
* @default
* @type struct<terms>
*
* @param dataList
* @text データリスト
* @desc セーブデータに表示される項目で、先に入れたものが上に表示されます。要らない項目は削除して下さい。
* @default variable,mapname,gold,playtime
*
* @param variableId
* @text 変数
* @desc 設定値を1以上にし、データリストにvariableを追加すると使用できます。
* @type variable
*
* @param padding
* @text パディング
* @desc 情報表示の位置を調整します。
* @type number
* @default 264
* @min -9999999
*
* @param itemPadding
* @text 要素パディング
* @desc 項目内容の位置を調整します。
* @type number
* @default 8
* @min -9999999
*
* @param itemNameWidth
* @text 項目名幅
* @desc 項目名の幅を調整します。
* @type number
* @default 128
*
* @param itemNameBackWidth
* @text 項目名背景幅
* @desc 項目名背景の幅を調整します。
* @type number
* @default 192
*
* @param itemNameAlign
* @text 項目名整列
* @desc 項目名を整列します。
* @type select
* @option left
* @option center
* @option right
* @default center
*
*/

/*~struct~info2:
*
* @param variableId
* @text Variable
* @desc It can be used when the setting value is 1 or more.
* @default 0
* @type variable
*
* @param offsetX
* @text Offset X
* @desc Adjust the position of variables.
* @type number
* @default 44
* @min -9999999
*
* @param offsetY
* @text Offset Y
* @desc Adjust the position of variables.
* @type number
* @default 0
* @min -9999999
*
* @param width
* @text Width
* @desc Limit the width of the variable. Disabled with 0.
* @type number
* @default 212
*
* @param align
* @text Text Align
* @type select
* @default left
* @option left
* @option center
* @option right
*
* @param offsetX2
* @text Offset X2
* @desc Adjust the variable position of the autosave item.
* Disabled if not entered.
* @type number
* @min -9999999
*
* @param offsetY2
* @text Offset Y2
* @desc Adjust the variable position of the autosave item.
* Disabled if not entered.
* @type number
* @min -9999999
*
* @param width2
* @text Width2
* @desc Limits the width of variables in autosave items.
* Disabled if not entered.
* @type number
*
*/

/*~struct~info2:ja
*
* @param variableId
* @text 変数
* @desc 設定値を1以上にすると使用できます。
* @default 0
* @type variable
*
* @param offsetX
* @text オフセットX
* @desc 変数の位置を調整します。
* @type number
* @default 44
* @min -9999999
*
* @param offsetY
* @text オフセットY
* @desc 変数の位置を調整します。
* @type number
* @default 0
* @min -9999999
*
* @param width
* @text 幅
* @desc 変数の幅を制限します。0で無効。
* @type number
* @default 212
*
* @param align
* @text 文字寄せ
* @type select
* @default left
* @option left
* @option center
* @option right
*
* @param offsetX2
* @text オフセットX２
* @desc オートセーブの項目の変数の位置を調整します。
* 未入力で無効。
* @type number
* @min -9999999
*
* @param offsetY2
* @text オフセットY２
* @desc オートセーブの項目の変数の位置を調整します。
* 未入力で無効。
* @type number
* @min -9999999
*
* @param width2
* @text 幅２
* @desc オートセーブの項目の変数の幅を制限します。
* 未入力で無効。
* @type number
*
*/

/*~struct~levelInfo:
*
* @param enabled
* @text Enable
* @desc Show level.
* @type boolean
* @default false
*
* @param offsetX
* @text Offset X
* @desc Adjust the position of the level.
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text Offset Y
* @desc Adjust the position of the level.
* @type number
* @default -76
* @min -9999999
*
* @param width
* @text Width
* @desc Adjust the width of the level.
* @type number
* @default 40
* @min -9999999
*
* @param offsetFontSize
* @text Offset Font Size
* @desc Specifies the relative size of the font.
* @type number
* @default -4
* @min -9999999
*
*/

/*~struct~levelInfo:ja
*
* @param enabled
* @text 有効化する
* @desc レベルを表示します。
* @type boolean
* @default false
*
* @param offsetX
* @text オフセットX
* @desc レベルの位置を調整します。
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text オフセットY
* @desc レベルの位置を調整します。
* @type number
* @default -76
* @min -9999999
*
* @param width
* @text 幅
* @desc レベルの幅を調整します。
* @type number
* @default 40
* @min -9999999
*
* @param offsetFontSize
* @text オフセットフォントサイズ
* @desc フォントの相対サイズを指定します。
* @type number
* @default -4
* @min -9999999
*
*/

/*~struct~partyCharacters:
*
* @param offsetX
* @text Offset X
* @desc Adjust the character's position.
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text Offset Y
* @desc Adjust the character's position.
* @type number
* @default 0
* @min -9999999
*
* @param distance
* @text Distance
* @desc Adjust the distance between characters.
* @type number
* @default 48
* @min -9999999
*
*/

/*~struct~partyCharacters:ja
*
* @param offsetX
* @text オフセットX
* @desc 歩行グラの位置を調整します。
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text オフセットY
* @desc 歩行グラの位置を調整します。
* @type number
* @default 0
* @min -9999999
*
* @param distance
* @text 距離
* @desc 歩行グラの間隔です。
* @type number
* @default 48
* @min -9999999
*
*/

/*~struct~icon:
*
* @param id
* @text Icon ID
* @desc It is displayed when the set value is 1 or more.
* @type icon
* @default 0
*
* @param offsetX
* @text Offset X
* @desc Adjust the position of the icon.
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text Offset Y
* @desc Adjust the position of the icon.
* @type number
* @default 0
* @min -9999999
*
*/

/*~struct~icon:ja
*
* @param id
* @text アイコンID
* @desc 設定値を1以上にすると表示します。
* @type icon
* @default 0
*
* @param offsetX
* @text オフセットX
* @desc アイコンの位置を調整します。
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text オフセットY
* @desc アイコンの位置を調整します。
* @type number
* @default 0
* @min -9999999
*
*/

/*~struct~title:
*
* @param offsetX
* @text Offset X
* @desc Adjust the title position.
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text Offset Y
* @desc Adjust the title position.
* @type number
* @default 0
* @min -9999999
*
*/

/*~struct~title:ja
*
* @param offsetX
* @text オフセットX
* @desc タイトルの位置を調整します。
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text オフセットY
* @desc タイトルの位置を調整します。
* @type number
* @default 0
* @min -9999999
*
*/

/*~struct~titleDeco:
*
* @param deco
* @text Decoration
* @desc Decorate in Fes style.
* @type boolean
* @default false
*
* @param disableTerms
* @text Disable Terms
* @desc Make the title index only.
* @type boolean
* @default true
*
* @param useNumberFont
* @text Use Number Font
* @desc Use a number font for the title.
* @type boolean
* @default true
*
* @param offsetFontSize
* @text Offset Font Size
* @desc Specifies the relative size of the font.
* @type number
* @default -4
* @min -9999999
*
* @param maxWidth
* @text Text Max Width
* @desc Specifies the maximum width of the title.
* Disabled with -1.
* @type number
* @default 180
* @min -1
*
* @param offsetX
* @text Offset X
* @desc Adjust the position of the title decoration.
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text Offset Y
* @desc Adjust the position of the title decoration.
* @type number
* @default 0
* @min -9999999
*
* @param offsetWidth
* @text Offset Width
* @desc Adjust the width of the title decoration.
* @type number
* @default 6
* @min -9999999
*
* @param offsetHeight
* @text Offset Height
* @desc Adjust the height of the title decoration.
* @type number
* @default 12
* @min -9999999
*
*/

/*~struct~titleDeco:ja
*
* @param deco
* @text 装飾
* @desc ツクフェス風に装飾する。
* @type boolean
* @default false
*
* @param disableTerms
* @text 用語無効化
* @desc タイトルをインデックスのみにします。
* @type boolean
* @default true
*
* @param useNumberFont
* @text 数字フォントを使用する
* @desc タイトルに数字フォントを使用します。
* @type boolean
* @default true
*
* @param offsetFontSize
* @text オフセットフォントサイズ
* @desc フォントの相対サイズを指定します。
* @type number
* @default -4
* @min -9999999
*
* @param maxWidth
* @text テキスト最大幅
* @desc タイトルの最大幅を指定します。
* -1で無効。
* @type number
* @default 180
* @min -1
*
* @param offsetX
* @text オフセットX
* @desc タイトル装飾の位置を調整します。
* @type number
* @default 0
* @min -9999999
*
* @param offsetY
* @text オフセットY
* @desc タイトル装飾の位置を調整します。
* @type number
* @default 0
* @min -9999999
*
* @param offsetWidth
* @text オフセット幅
* @desc タイトル装飾の幅を調整します。
* @type number
* @default 6
* @min -9999999
*
* @param offsetHeight
* @text オフセット高さ
* @desc タイトル装飾の高さを調整します。
* @type number
* @default 12
* @min -9999999
*
*/

'use strict';

{
	//プラグイン名取得。
	const script = document.currentScript;
	const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];

	const analyzeParam = paramStr => {
		try {
			const param = JSON.parse(paramStr);
			try {
				for (const prop in param) {
					param[prop] = analyzeParam(param[prop]);
				}
				return param;
			} catch (e) {
				return param;
			}
		} catch (e) {
			return paramStr;
		}
	};

	const parameters = PluginManager.parameters(pluginName);
	for (const param in parameters) {
		parameters[param] = analyzeParam(parameters[param]);
	}

	const noData = parameters["noData"];
	const dontPopScene = parameters["dontPopScene"];
	const enableDimmer = parameters["enableDimmer"];
	const icon = parameters["icon"];
	const fesLayout = parameters["fesLayout"];
	const fileDeco = parameters["fileDeco"];
	const noSpace = parameters["noSpace"];

	const levelInfo = parameters["levelInfo"];
	const partyCharacters = parameters["partyCharacters"];
	const info1 = parameters["info1"];
	{
		info1["dataList"] = info1["dataList"] ? info1["dataList"].split(',') : [];
		if (!info1.variableId) {
			info1.dataList = info1.dataList.filter(data => data !== "variable");
		}

	}
	const info2 = parameters["info2"];
	{
		const offsetX2 = info2.offsetX2;
		const offsetY2 = info2.offsetY2;
		const width2 = info2.width2;
		if (offsetX2 === "") {
			info2.offsetX2 = info2.offsetX;
		}
		if (offsetY2 === "") {
			info2.offsetY2 = info2.offsetY;
		}
		if (width2 === "") {
			info2.width2 = info2.width;
		}
	}
	const numVisibleRows = parameters["numVisibleRows"];
	const numSaveFiles = parameters["numSaveFiles"] + 1;
	const title = parameters["title"];
	const titleDeco = parameters["titleDeco"];

	//9以下の数字を全角に変換
	const h2f = s => s.replace(/[0-9]/g, s => String.fromCharCode(s.charCodeAt(0) + 0xFEE0));

	if (dontPopScene) {
		Scene_Save.prototype.onSaveSuccess = function() {
			SoundManager.playSave();
			this.activateListWindow();
			this._listWindow.refresh();
		};
	}

	//-----------------------------------------------------------------------------
	// DataManager

	if (numSaveFiles > 0) {
		DataManager.maxSavefiles = function() {
			return numSaveFiles;
		};
	}

	//-----------------------------------------------------------------------------
	// Window_SavefileList

	Window_SavefileList.prototype.drawPartyCharacters = function(info, x, y) {
		x += partyCharacters.offsetX;
		y += partyCharacters.offsetY;
		if (info.characters) {
			let characterX = x;
			for (const data of info.characters) {
				this.drawCharacter(data[0], data[1], characterX, y);
				characterX += partyCharacters.distance;
			}
		}
	};

	if (noData) {
		const _Window_SavefileList_drawItem = Window_SavefileList.prototype.drawItem;
		Window_SavefileList.prototype.drawItem = function(index) {
			_Window_SavefileList_drawItem.call(this, index);
			const savefileId = this.indexToSavefileId(index);
			const info = DataManager.savefileInfo(savefileId);
			if (!info) {
				const rect = this.itemLineRect(index);
				this.drawText(noData, rect.x, rect.y, rect.width, "center");
			}
		};
	}

	if (noSpace) {
		//-----------------------------------------------------------------------------
		// Scene_File

		const _Scene_File_helpWindowRect = Scene_File.prototype.helpWindowRect;
		Scene_File.prototype.helpWindowRect = function() {
			const rect = _Scene_File_helpWindowRect.call(this);
			rect.y = rect.y/2 - rect.height/2+(Graphics.height - Graphics.boxHeight)/2;
			return rect;
		};

		const _Scene_File_listWindowRect = Scene_File.prototype.listWindowRect;
		Scene_File.prototype.listWindowRect = function() {
			const rect = _Scene_File_listWindowRect.call(this);
			rect.y -= this.mainAreaTop();
			rect.height += this.mainAreaTop();
			return rect;
		};
		

	}

	if (enableDimmer) {
		//-----------------------------------------------------------------------------
		// Scene_File

		Scene_File.prototype.createHelpWindow = function() {
			const rect = this.helpWindowRect();
			this._helpWindow = new Window_FileHelp(rect);
			this.addWindow(this._helpWindow);
		};

		const _Scene_File_helpWindowRect = Scene_File.prototype.helpWindowRect;
		Scene_File.prototype.helpWindowRect = function() {
			const rect = _Scene_File_helpWindowRect.call(this);
			rect.width = Math.floor(2*Graphics.boxWidth/3);
			rect.x = Math.floor((Graphics.boxWidth - rect.width)/2);
			return rect;
		};

		function Window_FileHelp() {
			this.initialize(...arguments);
		}

		Window_FileHelp.prototype = Object.create(Window_Help.prototype);
		Window_FileHelp.prototype.constructor = Window_FileHelp;

		Window_FileHelp.prototype.initialize = function(rect) {
			Window_Help.prototype.initialize.call(this, rect);
			this.opacity = 0;
		};

		Window_FileHelp.prototype.refresh = function() {
			this.start();
			const rect = this.baseTextRect();
			this.contents.clear();
			Window_MapName.prototype.drawBackground.call(this, 0, 0, this.innerWidth, this.lineHeight());
			this.drawTextEx(this._text, rect.x, rect.y, rect.width);
		};

		Window_FileHelp.prototype.start = function() {
			this.updatePlacement();
			this.createContents();
		};

		Window_FileHelp.prototype.setText = function(text) {
			text = "　　" + text + "　　";
			Window_Help.prototype.setText.call(this, text);
		};

		Window_FileHelp.prototype.updatePlacement = function() {
			this.width = this.windowWidth();
			this.height = this.windowHeight();
			this.x = Math.floor((Graphics.boxWidth - this.width)/2);
		};

		Window_FileHelp.prototype.windowWidth = function() {
			if (this._text) {
				const textWidth = this.textSizeEx(this._text).width;
				const padding = this.padding + this.itemPadding();
				const width = Math.ceil(textWidth) + padding * 2;
				return Math.min(width, Graphics.boxWidth);
			} else {
				return 0;
			}
		};

		Window_FileHelp.prototype.windowHeight = function() {
			return this.fittingHeight(1);
		};
	}

	if (fesLayout) {

		if (titleDeco.deco) {

			Window_SavefileList.prototype.drawTitle = function(savefileId, x, y) {
				x -= 6;
				y -= 6;
				if (titleDeco.useNumberFont) {
					this.contents.fontFace = $gameSystem.numberFontFace();
				}
				this.contents.fontSize += titleDeco.offsetFontSize;
				const text = this.titleText(savefileId);
				const textSize = { "width": this.textWidth(text), "height": this.lineHeight() };
				const maxWidth = titleDeco.maxWidth;
				if (maxWidth !== -1) {
					textSize.width = Math.min(textSize.width, maxWidth);
				}
				const col = "white";
				const offsetX = titleDeco.offsetX;
				const offsetY = titleDeco.offsetY;
				const offsetW = titleDeco.offsetWidth;
				const offsetH = titleDeco.offsetHeight - this.lineHeight()+this.contents.fontSize;
				const x2 = Math.trunc(x + offsetX - offsetW/2);
				const y2 = Math.trunc(y + offsetY - offsetH/2);
				const w2 = Math.trunc(textSize.width + offsetW);
				const h2 = Math.trunc(textSize.height + offsetH);
				const radius = 8;
				this.changePaintOpacity(true);
				this.contents.drawSaveFilePlusTitleDeco(x2, y2, w2, h2, radius, col);
				this.changeOutlineColor("rgba(0, 0, 0, 0)");
				this.changeTextColor("black");
				if (text.startsWith("0")) {
					const offsetX = textSize.width/4;
					this.drawText(text.slice(1), x + offsetX, y, textSize.width - offsetX);
				} else {
					this.drawText(text, x, y, textSize.width);
				}
				this.changePaintOpacity(this.isEnabled(savefileId));
				this.resetFontSettings();
			};

			Bitmap.prototype.drawSaveFilePlusTitleDeco = function(x, y, width, height, radius, color) {
				const context = this.context;
				context.save();
				context.fillStyle = color;
				context.beginPath();
				context.moveTo(x+radius, y);
				context.lineTo(x+width, y);
				context.arcTo(x+width, y+height, x+radius, y+height, radius);
				context.lineTo(x, y+height);
				context.arcTo(x, y, x+radius, y, radius);
				context.closePath(x+radius, y);
				context.fill();
				context.restore();
				this._baseTexture.update();
			};

			Window_SavefileList.prototype.titleText = function(savefileId) {
				if (savefileId === 0) {
					return TextManager.autosave;
				}
				if (!titleDeco.disableTerms && TextManager.file) {
					return TextManager.file + " " + savefileId;
				}
				if (savefileId >= 10) {
					return String(savefileId);
				}
				return titleDeco.useNumberFont ? String(savefileId).padStart( 2, '0') : h2f(String(savefileId));
			};
		}

		const _Window_SavefileList_drawItem = Window_SavefileList.prototype.drawItem;
		Window_SavefileList.prototype.drawItem = function(index) {
			const savefileId = this.indexToSavefileId(index);
			const info = DataManager.savefileInfo(savefileId);
			this._isAutoSave = savefileId === 0;
			_Window_SavefileList_drawItem.call(this, index);
		};

		Window_SavefileList.prototype.drawContents = function(info, rect) {
			const bottom = rect.y + rect.height;
			if (rect.width > 0) {
				this.drawPartyCharacters(info, rect.x + 48, bottom - 8);
			}
			const lineHeight = this.lineHeight();
			const padding = info1.padding;
			const x2 = rect.x + padding;
			const w2 = rect.width - padding;
			const maxLines = Math.floor(rect.height/this.lineHeight());
			const numLines = this.visibleData().length;
			const y2 = bottom - (rect.height + lineHeight * maxLines)/2 + lineHeight*(maxLines-numLines-1);
			this.drawPlaytime(info, x2, y2, w2);
			if (info2.variableId) {
				const offsetX = !this._isAutoSave ? info2.offsetX : info2.offsetX2;
				const offsetY = !this._isAutoSave ? info2.offsetY : info2.offsetY2;
				const width = !this._isAutoSave ? info2.width : info2.width2;
				const align = info2.align;
				this.drawText(info.variable2, rect.x + offsetX, rect.y + offsetY, width, align);
			}
		};

		Window_SavefileList.prototype.drawPlaytime = function(info, x, y, width) {
			const titleBackWidth = info1.itemNameBackWidth;
			const titleWidth = info1.itemNameWidth;
			const titleAlign = info1.itemNameAlign;
			const largeTitle = titleBackWidth < titleWidth;
			const titlePadding = Math.abs((titleBackWidth - titleWidth)/2);
			const titleBackX = x + (largeTitle ? titlePadding : 0);
			const titleX = x + (largeTitle ? 0 : titlePadding);
			const textPadding = Math.max(titleBackWidth, titleWidth) + info1.itemPadding;
			const valueX = x + textPadding;
			const valueWidth = width - textPadding;
			const lineHeight = this.lineHeight();
			const col = "#606060";
			const data = this.visibleData();
			data.forEach((data, index) => {
				const n = index + 1;
				const infoY = y + lineHeight*n;
				if (titleBackWidth > 0) {
					this.contents.drawSaveFilePlusTitleBack(titleBackX, infoY + 2, titleBackWidth, lineHeight - 4, col);
				}
				if (titleWidth > 0) {
					this.drawText(info1.terms[data], titleX, infoY, titleWidth, titleAlign);
				}
				this.drawText(info[data], valueX, infoY, valueWidth, "right");
			});
		};

		Bitmap.prototype.drawSaveFilePlusTitleBack = function(x, y, width, height, color) {
			const context = this.context;
			context.save();
			context.fillStyle = color;
			const radius = height / 2;
			context.beginPath();
			context.moveTo(x+radius, y);
			context.arcTo(x+width, y, x+width, y+radius, radius);
			context.arcTo(x+width, y+height, x+radius, y+height, radius);
			context.arcTo(x, y+height, x, y+radius, radius);
			context.arcTo(x, y, x+radius, y, radius);
			context.closePath(x+radius, y);
			context.fill();
			context.restore();
			this._baseTexture.update();
		};

		Window_SavefileList.prototype.visibleData = function() {
			return info1.dataList;
		};

		const _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
		DataManager.makeSavefileInfo = function() {
			const info = _DataManager_makeSavefileInfo.call(this);
			if (info1.dataList.includes("mapname")) {
				info.mapname = $gameMap.displayName() || $dataMapInfos[$gameMap.mapId()].name;
			}
			if (info1.dataList.includes("gold")) {
				info.gold = $gameParty.gold() + TextManager.currencyUnit;
			}
			if (info1.dataList.includes("variable")) {
				info.variable = $gameVariables.value(info1.variableId);
			}
			if (info2.variableId) {
				info.variable2 = $gameVariables.value(info2.variableId);
			}
			return info;
		};

	}

	if (levelInfo.enabled) {

		const _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
		DataManager.makeSavefileInfo = function() {
			const info = _DataManager_makeSavefileInfo.call(this);
			info.levels = $gameParty.levelsForSavefile();
			return info;
		};

		Game_Party.prototype.levelsForSavefile = function() {
			return this.battleMembers().map(actor => actor.level);
		};

		const _Window_SavefileList_drawPartyCharacters = Window_SavefileList.prototype.drawPartyCharacters;
		Window_SavefileList.prototype.drawPartyCharacters = function(info, x, y) {
			_Window_SavefileList_drawPartyCharacters.apply(this, arguments);
			this.drawPartyLevels(...arguments);
		};

		Window_SavefileList.prototype.drawPartyLevels = function(info, x, y) {
			if (info.levels) {
				let characterX = x;
				for (const data of info.levels) {
					this.drawLevelInfo(data, characterX, y);
					characterX += partyCharacters.distance;
				}
			}
		};

		Window_SavefileList.prototype.drawLevelInfo = function(data, x, y) {
			const width = levelInfo.width;
			const level = data > 9 ? data : h2f(String(data));

			const tw1 = this.textWidth(TextManager.levelA);
			const tw2 = this.textWidth(" " + level);
			const ratio = tw1/(tw1+tw2);
			const w1 = width * ratio;
			const w2 = width - w1;

			x += levelInfo.offsetX + partyCharacters.offsetX - width/2;
			y += levelInfo.offsetY;

			this.contents.fontSize += levelInfo.offsetFontSize;
			this.changeTextColor(ColorManager.systemColor());
			this.drawText(TextManager.levelA, x, y, w1);
			this.resetTextColor();
			
			this.drawText(" " + level, x + w1, y, w2, "right");
			this.resetFontSettings();
		};

	}

	if (icon.id) {
		let noSavefile = false;
		const _Window_SavefileList_drawItem = Window_SavefileList.prototype.drawItem;
		Window_SavefileList.prototype.drawItem = function(index) {
			const savefileId = this.indexToSavefileId(index);
			const info = DataManager.savefileInfo(savefileId);
			_Window_SavefileList_drawItem.call(this, index);
			if (this.canDrawMarker(info, savefileId)) {
				const rect = this.itemRect(index);
				this.drawIcon(icon.id, rect.x + icon.offsetX, Math.floor(rect.y + (rect.height - ImageManager.iconHeight)/2)+icon.offsetY);
			}
		};

		Window_SavefileList.prototype.canDrawMarker = function(info, savefileId) {
			if (!info) {
				return false;
			} else if (this._mode === "save" && $gameSystem.savefileId() !== savefileId) {
				return false;
			} else if (this._mode === "load" && DataManager.latestSavefileId() !== savefileId) {
				return false;
			} else if (this._mode === "save" && !noSavefile) {
				return true;
			} else if (this._mode === "load") {
				return true;
			} else {
				return false;
			}
		};

		const _DataManager_selectSavefileForNewGame = DataManager.selectSavefileForNewGame;
		DataManager.selectSavefileForNewGame = function() {
			_DataManager_selectSavefileForNewGame.call(this);
			noSavefile = true;
		};

		let autoSave = false;
		const _Scene_Base_executeAutosave = Scene_Base.prototype.executeAutosave;
		Scene_Base.prototype.executeAutosave = function() {
			autoSave = true;
			_Scene_Base_executeAutosave.call(this);
			autoSave = false;
		};

		const _Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
		Game_System.prototype.onBeforeSave = function() {
			_Game_System_onBeforeSave.call(this);
			if (!autoSave) noSavefile = false;
		};

		const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
		Game_System.prototype.onAfterLoad = function() {
			_Game_System_onAfterLoad.call(this);
			noSavefile = false;
		};
	}

	if (numVisibleRows > 0) {
		Window_SavefileList.prototype.numVisibleRows = function() {
			return numVisibleRows;
		};
	}

	const _Window_SavefileList_drawTitle = Window_SavefileList.prototype.drawTitle;
	Window_SavefileList.prototype.drawTitle = function(savefileId, x, y) {
		_Window_SavefileList_drawTitle.call(this, savefileId, x + title.offsetX, y + title.offsetY);
	};

}