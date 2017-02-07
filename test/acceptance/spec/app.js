define(function (require) {

    var Env = require('acceptance/helper/env');

    describe('Application', function () {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('WHEN page stats is clicked THEN app is switched to editor', function() {
            // GIVEN
            env.user.create_new_script('test');
            env.user.open_plugin('stats');

            // WHEN
            env.user.click_on_page_stats();

            // THEN
            env.assert.active_plugin_is('editor');
        });

        it.skip('WHEN expand button is clicked THEN content spans the whole window', function() {

        });

        it.skip('GIVEN content is expanded WHEN expand button is clicked THEN content narrows back', function() {

        });

        it.skip('WHEN close content is clicked THEN content is hidden', function() {

        });

        it.skip('WHEN a top menu item is selected THEN selected plugin is displayed', function() {

        });

        it.skip('WHEN a main menu item is selected THEN selected plugin is displayed', function(){

        });

        it.skip('WHEN a selected plugin is re-selected from the top menu THEN the same plugin is shown', function() {

        });

        it.skip('GIVEN a plugin is opened WHEN background is clicked THEN content is hidden', function() {
            
        });
        
    });

});