define(function(require) {
    
    var Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        ThemeModel = require('theme/aw-bubble/model/theme-model');
    
    var DialogPresenter = Protoplast.Object.extend({
        
        themeController: {
            inject: ThemeController
        },
        
        themeModel: {
            inject: ThemeModel
        },
        
        init: function() {

            Protoplast.utils.bindProperty(this.themeModel, 'dialog', this.view, 'dialog');
            this.view.on('buttonClicked', this._handleButtonClicked);
            this.view.on('closeClicked', this._handleCloseClicked);
        },
        
        _handleButtonClicked: function(buttonLabel) {
            this.themeController.commitDialog(buttonLabel)
        },

        _handleCloseClicked: function() {
            this.themeController.closeDialog();
        }
        
    });
    
    return DialogPresenter;
});