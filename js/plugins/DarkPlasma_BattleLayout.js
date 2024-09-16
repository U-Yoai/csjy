// DarkPlasma_BattleLayout 1.0.1
// Copyright (c) 2023 DarkPlasma

/**
 * 2023/09/18 1.0.1 入力完了後のステータスウィンドウ位置を左下に移動する
 *            1.0.0 初版
 */

/*:
 * @plugindesc NoFuture用 戦闘画面レイアウト
 * @author DarkPlasma
 * @license No License
 *
 * @target MZ
 *
 * @orderAfter ChangeMaxUnitBattleParty
 *
 * @param statusWindowWidth
 * @text ステータスウィンドウ幅
 * @type number
 * @default 184
 *
 * @help
 * version: 1.0.1
 * 戦闘画面レイアウトを調整します。
 *
 * 下記プラグインと共に利用する場合、それよりも下に追加してください。
 * ChangeMaxUnitBattleParty
 */

(() => {
  'use strict';

  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });

  const pluginParametersOf = (pluginName) => PluginManager.parameters(pluginName);

  const pluginParameters = pluginParametersOf(pluginName);

  const settings = {
    statusWindowWidth: Number(pluginParameters.statusWindowWidth || 184),
  };

  function Scene_Battle_LayoutMixIn(sceneBattle) {
    sceneBattle.isRightInputMode = function () {
      return false;
    };
    const _statusWindowRect = sceneBattle.statusWindowRect;
    sceneBattle.statusWindowRect = function () {
      const rect = _statusWindowRect.call(this);
      rect.width = settings.statusWindowWidth;
      return rect;
    };
    const _statusWindowX = sceneBattle.statusWindowX;
    sceneBattle.statusWindowX = function () {
      if (this.isAnyInputWindowActive()) {
        return _statusWindowX.call(this);
      }
      return 0;
    };
  }
  Scene_Battle_LayoutMixIn(Scene_Battle.prototype);
  function Window_BattleStatus_LayoutMixIn(windowClass) {
    windowClass.maxCols = function () {
      return 1;
    };
  }
  Window_BattleStatus_LayoutMixIn(Window_BattleStatus.prototype);
})();
