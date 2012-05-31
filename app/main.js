/**
 * main
 * ===========
 *
 */
define(['data/vector_document', 'interface/point_controller'], function (vd, pc) {

    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight,
            ctx = canvas.getContext('2d'),
            origin = null,
            controller = null;

    document.body.appendChild(canvas);

    var doc = new vd(),
            mousepos = null;

    console.log('Hit N to start a new path.');

    $(canvas).bind('mousemove', function (e) {
        mousepos = new Point(e.clientX, e.clientY);

        if (origin != null) {
            var target = new Point(origin.x - e.clientX, origin.y - e.clientY);
            ctx.translate(target.x, target.y);
            console.log(target.x, target.y);
            var actual_path = doc.at(doc.length - 1);
            actual_path.render();
        }
    });

    $(document).bind('keydown', function (e) {
        console.log('You pressed the button: ' + e.keyCode);
        switch (e.keyCode) {
            case 78: //n
                doc.add({
                    base:mousepos
                });

                controller = new pc(doc.at(doc.length - 1));
                document.body.appendChild(controller.el);
                $(controller.el).bind('mousemove', function (e) {
                    mousepos = new Point(e.clientX, e.clientY);
                });
                break;
            case 32: //space
                if (!doc.length) {
                    console.log('Create a new path first.');
                    return;
                }
                ;
                var actual_path = doc.at(doc.length - 1),
                        pointer = actual_path.get('pointer');
                actual_path.add_segment([
                    new Point(mousepos.x - (mousepos.x - pointer.x) / 2, mousepos.y - (mousepos.y - pointer.y) / 2),
                    new Point(mousepos.x, mousepos.y)
                ]);

                actual_path.render(ctx);
                break;
            case 69: //e
                var actual_path = doc.at(doc.length - 1),
                        dta = actual_path.toJSON(),
                        result = [],
                        nseg;

                _.each(dta.segments, function (seg) {
                    nseg = [];
                    _.each(seg, function (point) {
                        nseg.push(new Point(point.x, point.y));
                    });
                    result.push(nseg);
                });

                result.unshift(new Point(dta.base.x, dta.base.y));

                console.log(JSON.stringify(result));
                break;
            case 37: //left
                controller.move(-100, 0);
                var bgx = parseInt($(document.body).css('background-position-x')) - 100;
                $(document.body).css('background-position-x', bgx + 'px');
                break;
            case 39: //right
                controller.move(100, 0);
                var bgx = parseInt($(document.body).css('background-position-x')) + 100;
                $(document.body).css('background-position-x', bgx + 'px');
                break;
            case 38: //up
                controller.move(0, -100);
                var bgy = parseInt($(document.body).css('background-position-y')) - 100;
                $(document.body).css('background-position-y', bgy + 'px');
                break;
            case 40: //down
                controller.move(0, 100);
                var bgy = parseInt($(document.body).css('background-position-y')) + 100;
                $(document.body).css('background-position-y', bgy + 'px');
                break;
            case 66: //b
                var url = prompt('Enter the URL of a background-image to display.');
                $(document.body).css({
                    'background-image':'url(' + url + ')'
                });
                break;
            case 76: //l
                var url = prompt('Enter the URL of a JSON file to load.');
                $.getJSON(url, function(response){

                });
                break;
        }
    });
});