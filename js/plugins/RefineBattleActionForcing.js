//=============================================================================
// Plugin for RPG Maker MZ
// RefineBattleActionForcing.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Don't reset subject's action after action forcing
 * @author Sasuke KANNAZUKI
 *
 * @help
 * This plugin does not provide plugin commands.
 *
 * [Summary]
 * At default system, when event command 'Battle Action Forcing' executed,
 * it resets all the subject's surplus actions.
 * This pluin solves the problem.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @target MZ
 * @plugindesc 「戦闘行動の強制」後、残りの行動がキャンセルされるのを防ぎます。
 * @author 神無月サスケ
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 *
 * ■概要
 * イベントコマンド「戦闘行動の強制」を行うと、仮にそのアクターが予定していた
 * 行動があっても、すべてキャンセルされます。
 * このプラグインは、その問題を解決します。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {

  var numActionAtForceing = null;

  Game_Battler.prototype.isActionForcing = function () {
    if ($gameParty.inBattle()) {
      if (numActionAtForceing) {
        if (numActionAtForceing !== this.numActions()) {
          numActionAtForceing = null;
          return false;
        }
        return true;
      }
    }
    return false;
  };

  var _Game_Battler_clearActions = Game_Battler.prototype.clearActions;
  Game_Battler.prototype.clearActions = function() {
    if (!this.isActionForcing()) {
      _Game_Battler_clearActions.call(this);
    }
  };

  var _Game_Battler_forceAction = Game_Battler.prototype.forceAction;
  Game_Battler.prototype.forceAction = function(skillId, targetIndex) {
    numActionAtForceing = this.numActions();
    _Game_Battler_forceAction.call(this, skillId, targetIndex);
    // move last action to top
    var action = this._actions.pop();
    this._actions.unshift(action);
  };


  BattleManager.forceAction = function(battler) {
    this._actionForcedBattler = battler;
    //var index = this._actionBattlers.indexOf(battler);
    //if (index >= 0) {
    //  this._actionBattlers.splice(index, 1);
    //}
  };

})();
