define(function(require) {

    var template = require('text!plugin/stats/view/stats.hbs'),
        $ = require('jquery'),
        helper = require('utils/helper'),
        charts = require('modules/charts'),
        Header = require('aw-bubble/view/header'),
        Protoplast = require('p'),
        SectionViewMixin = require('aw-bubble/view/section-view-mixin'),
        StatsViewPresenter = require('plugin/stats/view/stats-view-presenter'),
        ThemeModel = require('aw-bubble/model/theme-model'),
        ThemeController = require('aw-bubble/controller/theme-controller'),
        HandlebarComponent = require('utils/handlebar-component');

    return HandlebarComponent.extend([SectionViewMixin], {

        $meta: {
            presenter: StatsViewPresenter
        },
        
        hbs: template,

        themeController: {
            inject: ThemeController
        },

        themeModel: {
            inject: ThemeModel
        },

        whoWithWhoHeader: {
            component: Header
        },

        scriptPulseHeader: {
            component: Header
        },

        sceneLengthHeader: {
            component: Header
        },
        
        locationsBreakdownHeader:{
            component: Header
        },

        pageBalanceHeader: {
            component: Header
        },

        daysAndNightsHeader: {
            component: Header
        },

        intVsExtHeader: {
            component: Header
        },

        data: null,

        init: function() {
            Protoplast.utils.bind(this, 'data', this._render);
            
            this.whoWithWhoHeader.title = "Who talks with who (by number of scenes)";
            this.whoWithWhoHeader.description = "Each character is represented by a circle (max. 10 characters). If characters are connected with a line that means they are talking in the same scene. Thicker the line - more scenes together. Hover the mouse cursor over a character circle to see how many dialogues scenes that character have with other characters.";

            this.scriptPulseHeader.title = "Script Pulse";
            this.scriptPulseHeader.description = "Short scenes and short action/dialogue blocks bump the tempo up. Long scenes and long blocks set it back.";
            
            this.sceneLengthHeader.title = "Scene length";
            this.sceneLengthHeader.description = "Each bar represent one scene (white bars for day scenes, black bars for night scenes). Hover the mouse cursor over a bar to see estimated time of a scene. You can click on a bar to jump to selected scene in the editor.";
            
            this.locationsBreakdownHeader.title = "Locations breakdown";
            this.locationsBreakdownHeader.description = "Blocks on the top strip represent amount of time spent in a location. If a location occurs more than once in the script, it's highlighted by a colour (white colour is used for each location occurring only once).<br />Pie chart below shows time distribution for each location. Mouse over the blocks to see corresponding data on the pie chart (and vice versa).";
            
            this.pageBalanceHeader.title = "Page balance";
            this.pageBalanceHeader.description = "Shows balance between action time and dialogue time on each page. Click on a page to jump to the editor.";

            this.daysAndNightsHeader.title = "Days and nights";
            this.daysAndNightsHeader.description = "Pie chart representing day vs night scenes breakdown. Hover over sections to see number of day/night scenes.";

            this.intVsExtHeader.title = "INT. vs EXT.";
            this.intVsExtHeader.description = "Pie chart representing interior vs exterior scenes breakdown. Hover over sections to see number of int/ext scenes.";
        },

        addInteractions: function() {
            var themeModel = this.themeModel;
            
            $('#stats-scene-length-type').on('change', this._render);

            Protoplast.utils.bind(themeModel, 'expanded', function() {
                if (this.active) {
                    this._render();
                }
            }.bind(this));
        },
        
        _render: function() {

            var themeController = this.themeController;
            var themeModel = this.themeModel;
            
            if (!this.data) {
                return;
            }
            
            charts.spider_chart.render('#who-with-who', this.data.who_with_who.characters, this.data.who_with_who.links, {
                label: 'name'
            });

            charts.bar_chart.render('#stats-scene-length', this.data.scenes, {
                tooltip: function(d) {
                    return d.header + ' (time: ' + helper.format_time(helper.lines_to_minutes(d.length)) + ')'
                },
                value: 'length',
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController),
                color: function(d) {
                    if ($('#stats-scene-length-type').val() === "int_ext") {
                        if (d.location_type === 'mixed') {
                            return '#777777';
                        } else if (d.location_type === 'int') {
                            return '#eeeeee';
                        } else if (d.location_type === 'ext') {
                            return '#111111';
                        } else if (d.location_type === 'other') {
                            return '#444444';
                        }
                    }

                    if (d.type == 'day') {
                        return '#eeeeee';
                    } else if (d.type == 'night') {
                        return '#222222';
                    } else {
                        return '#777777';
                    }
                },
                bar_click: function(d) {
                    if (!themeModel.small) {
                        this._goto(d.token.line);
                    }
                }.bind(this)
            });

            charts.pie_chart.render('#stats-days-and-nights', this.data.days_and_nights, {
                tooltip: function(d) {
                    return d.data.label + ': ' + d.data.value + (d.data.value == 1 ? ' scene' : ' scenes')
                },
                value: 'value',
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController),
                color: function(d) {
                    if (d.data.label == 'DAY') {
                        return '#eeeeee';
                    } else if (d.data.label == 'NIGHT') {
                        return '#222222';
                    } else if (d.data.label == 'DAWN') {
                        return '#777777';
                    } else if (d.data.label == 'DUSK') {
                        return '#444444';
                    } else {
                        return '#aaaaaa';
                    }
                }
            });

            var int_ext_labels = {
                int: 'INT.',
                ext: 'EXT.',
                mixed: 'INT./EXT.',
                other: 'OTHER'
            };

            charts.pie_chart.render('#stats-int-ext', this.data.int_and_ext, {
                tooltip: function(d) {
                    return int_ext_labels[d.data.label] + ': ' + d.data.value + (d.data.value == 1 ? ' scene' : ' scenes')
                },
                value: 'value',
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController),
                color: function(d) {
                    if (d.data.label == 'mixed') {
                        return '#777777';
                    } else if (d.data.label == 'int') {
                        return '#eeeeee';
                    } else if (d.data.label == 'ext') {
                        return '#111111';
                    } else if (d.data.label == 'other') {
                        return '#444444';
                    }
                }
            });

            charts.page_balance_chart.render('#stats-page-balance', this.data.page_balance, {
                page_click: function(d) {
                    if (!themeModel.small) {
                        this._goto(d.first_line.token.line);
                    }
                }.bind(this),
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController)
            });

            charts.line_chart.render('#stats-tempo', this.data.tempo, {
                value: 'tempo',
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController),
                tooltip: function(d, i) {
                    if (i === this.data.tempo.length - 1) {
                        return '';
                    }
                    return d.scene + '<br />...' + d.line + '... ';
                }.bind(this),
                click: function(d) {
                    if (!themeModel.small) {
                        this._goto(d.line_no);
                    }
                }.bind(this)
            });

            charts.locations_breakdown.render('#locations-breakdown', this.data.locations_breakdown, {
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController)
            });

        },
        
        _goto: function(position) {
            this.dispatch('goto', position);
        }

    });

});