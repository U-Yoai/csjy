// [SQUARE PHOENIX] : http://enix.web.fc2.com/

/*:
* @plugindesc ふんばるプラグイン
* @author SQUARE PHOENIX
* @help
* ステート「ふんばる」の状態のときにどれだけダメージを受けても
* HPが１残ります。

* @param ふんばるステートＩＤ
* @desc ふんばるステートＩＤを指定します（数字）
* @default 999

* 利用規約：
*  自己責任で自由にお使いください。
*/

(function(){

  var param = PluginManager.parameters('hunbaru');
  var hunbaru_id = Number(param['ふんばるステートＩＤ'])||0;

  Game_BattlerBase.prototype.die = function() {
    if($gameActors.actor(this._actorId).isStateAffected(hunbaru_id)){//humbaru
      this._hp = 1;
      $gameActors.actor(this._actorId).removeState(hunbaru_id);
    }else{//moto
      this._hp = 0;
      this.clearStates();
      this.clearBuffs();
    }
  };
})();
