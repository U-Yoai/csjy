/*=============================================================================
 ItemList.js
----------------------------------------------------------------------------*/

/*:ja
 * @target MZ
 */

(()=>{
    'use strict'
   
    Window_ItemList.prototype.selectLast = function() {
        this.select(0);
    };   

    Window_SkillList.prototype.selectLast = function() {
        this.select(0);
    };
})();
