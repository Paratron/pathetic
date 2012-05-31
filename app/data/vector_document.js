/**
 * vector_document
 * ===========
 * This module creates documents which can store vector paths.
 */
define([], function () {

    /**
     * Global constructor for point objects.
     * @param x
     * @param y
     * @return {Object}
     * @constructor
     */
    Point = function (x, y) {
        return {
            x:x,
            y:y
        }
    }

    /**
     * A model to store basic paths.
     */
    var path_model = Backbone.Model.extend({
        defaults:{
            base:{x:0, y:0}, //The origin of the path.
            pointer:{x:0, y:0}, //The coordinates of the last point in the path.
            segments:[]
        },
        my_ctx: null,
        initialize:function () {
            this.set({
                pointer:this.get('base')
            })
        },
        /**
         * Adds a new segment to the stack.
         * Pass in a point to create a straight connector.
         * Pass in an array of two points to create a quadratic connector (P1 is the modifier, P2 is the target);
         * @param points
         */
        add_segment:function (points) {
            var newpoints;
            if (points instanceof Point) {
                newpoints = [points];
            } else {
                newpoints = points;
            }
            this.set({
                pointer:newpoints[newpoints.length - 1]
            });
            this.attributes.segments.push(newpoints);
            this.trigger('change', this);
            this.trigger('change:segments', this.attributes.segments);
        },
        remove_segment:function (index) {
            this.attributes.segments.splice(index, 0);
            this.trigger('change', this);
            this.trigger('change:segments', this.attributes.segments);
        },
        get_last_segment:function () {
            return this.attributes.segments[this.attributes.segments.length - 1];
        },
        set_point:function (segment_index, point_index, point) {
            if(segment_index == -1){
                this.set({
                    base: point
                });
                return;
            }
            this.attributes.segments[segment_index][point_index] = point;
            this.trigger('change', this);
            this.trigger('change:segments', this.attributes.segments);

            if(segment_index == this.attributes.segments.length-1 && point_index == this.attributes.segments[segment_index].length - 1){
                this.set({
                    pointer: point
                });
            }
        },
        get_point: function(segment_index, point_index){
            if(segment_index == -1){
                return this.attributes.base;
            }
            return this.attributes.segments[segment_index][point_index];
        },
        /**
         * Moves all points in a certain direction.
         * @param x
         * @param y
         */
        move: function(x,y){
            _.each(this.attributes.segments, function(seg){
                _.each(seg, function(point){
                   point.x += x;
                    point.y += y;
                });
            });
            this.attributes.base.x += x;
            this.attributes.base.y += y;
            this.trigger('change', this);
            this.trigger('change:segments', this.attributes.segments);
            this.trigger('change:base', this.attributes.base);
        },
        /**
         * Renders the path to a given canvas context.
         * @param ctx
         */
        render:function (ctx) {
            if(typeof ctx == 'undefined'){
                ctx = this.my_ctx;
            } else {
                this.my_ctx = ctx;
            }

            if(!ctx) return;

            var dta = this.toJSON();
            if (dta.segments.length == 0) return;

            ctx.clearRect(0,0,2000,2000);

            ctx.beginPath();
            ctx.moveTo(dta.base.x, dta.base.y);

            //Draw
            _.each(dta.segments, function (seg) {
                switch (seg.length) {
                    case 1:
                        //Straight line.
                        ctx.lineTo(seg[0].x, seg[0].y);
                        break;
                    case 2:
                        //quadratic bezier.
                        ctx.quadraticCurveTo(seg[0].x, seg[0].y, seg[1].x, seg[1].y);
                        break;
                    case 3:
                        //cubic bezier.
                        ctx.bezierCurveTo(seg[0].x, seg[0].y, seg[1].x, seg[1].y, seg[2].x, seg[2].y);
                }
            });
            ctx.stroke();


            ctx.moveTo(dta.base.x, dta.base.y);

        }
    });

    var path_collection = Backbone.Collection.extend({model:path_model});

    return function () {
        return new path_collection();
    }
});