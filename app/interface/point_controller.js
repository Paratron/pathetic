/**
 * point_controller
 * ===========
 * description
 */
define(['text!templates/control_point.html'], function (template_source) {
    var tpl_controller = _.template(template_source);

    var point_view = Backbone.View.extend({
        tagName:'div',
        className:'handler_container',
        events:{
            "mousedown .control_point":"activate_point",
            "mousemove":"move_point",
            "mouseup":"deactivate_point"
        },
        active_point:null,
        active_controller:null,
        active: {
            segment: null,
            point: null
        },
        initialize:function () {
            this.model.bind('change', this.render, this);
            this.render();
        },
        render:function () {
            var dta = this.model.toJSON(),
                    html = '';

            html += tpl_controller(_.extend(dta.base, {segment: -1, point: -1}));

            var seg_cnt = 0,
                    pt_cnt = 0;
            _.each(dta.segments, function (seg) {
                pt_cnt = 0;
                _.each(seg, function (pt) {
                    html += tpl_controller(_.extend(pt, {segment: seg_cnt, point: pt_cnt}));
                    pt_cnt++;
                });
                seg_cnt++;
            });

            this.el.innerHTML = html;

            return this;
        },

        //=================================================================================

        activate_point:function (e) {
            var $target = $(e.currentTarget),
                    segment_index = $target.attr('data-segment'),
                    point_index = $target.attr('data-point');

            this.active = {
                segment: segment_index,
                point: point_index
            }
            this.active_point = this.model.get_point(segment_index, point_index);
            this.active_controller = $target;
        },
        move_point:function (e) {
            if(this.origin != null){
                var target = new Point(e.clientX, e.clientY);
                ctx.translate(target.x, target.y);
                this.model.render();
            }

            if (this.active_point == null) return;
            this.active_controller.css({
                top: e.clientY,
                left: e.clientX
            });

            this.model.set_point(this.active.segment, this.active.point, new Point(e.clientX, e.clientY));
            this.model.render();
        },
        deactivate_point:function (e) {
            this.active_point = null;
        },

        //==================================================================================
        move: function(x, y){
            this.model.move(x,y);
            this.model.render();
        }
    });

    return function (model) {
        return new point_view({model:model});
    }
});