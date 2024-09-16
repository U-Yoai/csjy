//=============================================================================
// RPG Maker MZ - Manon_MenuVariable
//=============================================================================

/*:ja
 * @target MZ
 * @plugindesc メニュー画面に任意の変数を設置する
 * @author 天叢雲劍
 * 
 * @param showVariableNumber
 * @text 表示する変数番号
 * @default 1
 * @type number
 * 
 * @param firstText
 * @text 最初の文言を追加
 * @default メダル
 * @type string
 * 
 * @param unitText
 * @text 単位を追加します
 * @default 個
 * @type string
 * 
 * @help Manon_MenuVariable.js
 * 
 * メニュー画面のコマンドの下に変数の値を表示させます。
 *
 * 
 */
(function () {
    var parameters = PluginManager.parameters('Manon_MenuVariable');
    var showVariableNumber = Number(parameters['showVariableNumber']);
    var firstText = (parameters['firstText'] || "");
    var unitText = (parameters['unitText'] || "");

    Scene_Menu.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createCommandWindow();
         this.createVariableWindow();
        this.createGoldWindow();
        this.createStatusWindow();
    };

    Scene_Menu.prototype.createVariableWindow = function() {
        const rect = this.VariableWindowRect();
        this._variableWindow = new Window_Variable(rect);
        this.addWindow(this._variableWindow);
    };

    Scene_Menu.prototype.commandWindowRect = function() {
        const ww = this.mainCommandWidth();
        const wh = this.mainAreaHeight() - this.goldWindowRect().height - this.VariableWindowRect().height;
        const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
        const wy = this.mainAreaTop();
        return new Rectangle(wx, wy, ww, wh);
    };

    Scene_Menu.prototype.VariableWindowRect = function() {
        const ww = this.mainCommandWidth();
        const wh = this.calcWindowHeight(1, true);
        const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
        const wy = this.mainAreaBottom() - wh * 2;
        return new Rectangle(wx, wy, ww, wh);
    };

    Window_Base.prototype.drawVariableValue = function(firstText, value, unit, x, y, width) {
        const unitWidth = Math.min(80, this.textWidth(unit));
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(firstText, x, y, 240);
        this.resetTextColor();
        this.drawText(value, x, y, width - unitWidth - 6, "right");
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(unit, x + width - unitWidth, y, unitWidth, "right");
    };

    function Window_Variable() {
        this.initialize(...arguments);
    }

    Window_Variable.prototype = Object.create(Window_Selectable.prototype);
    Window_Variable.prototype.constructor = Window_Variable;

    Window_Variable.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this.refresh();
    };

    Window_Variable.prototype.colSpacing = function() {
        return 0;
    };

    Window_Variable.prototype.refresh = function() {
        const rect = this.itemLineRect(0);
        const x = rect.x;
        const y = rect.y;
        const width = rect.width;
        this.contents.clear();
        this.drawVariableValue(this.FirstText(), this.value(), this.currencyUnit(), x, y, width);
    };

    Window_Variable.prototype.value = function() {
        return $gameVariables.value(showVariableNumber)
    };

    Window_Variable.prototype.FirstText = function() {
        return firstText;
    };

    Window_Variable.prototype.currencyUnit = function() {
        return unitText;
    };

    Window_Variable.prototype.open = function() {
        this.refresh();
        Window_Selectable.prototype.open.call(this);
    };
})();