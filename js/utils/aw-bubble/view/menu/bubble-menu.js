define(function(require) {

    var Protoplast = require('aw-bubble/vendor/protoplast'),
        BubbleMenuPresenter = require('aw-bubble/presenter/menu/bubble-menu-presenter'),
        BubbleMenuItem = require('aw-bubble/view/menu/bubble-menu-item');

    var BubbleMenu = Protoplast.Component.extend({

        $meta: {
            presenter: BubbleMenuPresenter
        },

        tag: 'ul',

        sections: null,

        $create: function() {
            this.sections = Protoplast.Collection.create();
        },

        init: function() {
            this.root.className = 'selector';
            var view = this;
            Protoplast.utils.renderList(this, 'sections', {
                rendererDataProperty: 'section',
                renderer: BubbleMenuItem,
                create: function(parent, data, renderer, propertyName) {
                    var child = renderer.create();
                    child[propertyName] = data;
                    parent.add(child);
                    view.dispatch('menuItemAdded');
                }
            })
        },
        
        animateItem: function(section, attrs, delay) {
            var index = this.sections.toArray().indexOf(section);
            if (this.children[index]) {
                this.children[index].stopAnimation();
                this.children[index].animate(attrs, delay);
            }
        }

    });

    return BubbleMenu;
});