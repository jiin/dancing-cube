/*
    
    Dancing cube \o/

 */


var utils = {

    toRadians: function (angle) {
        return angle * (Math.PI / 180);
    },

    getCubeValues: function (data) {
        var values = [],
            sum = 0;

        for (i = 0; i < 1024; i++) {
            if (i % 16 == 0) {
                index = i / 16;
                values[index] = [];
            }

            values[index].push(data[i]);
        }

        var cubeValues = values.map(function (v) {
            sum = v.reduce(function (a, b) {
                return a + b;
            });

            return sum / v.length;
        });

        return cubeValues;
    }

};


function dance() {

    var context;
    

    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    } catch (e) {
        alert('Web Aong API is not supported in this browser');
    }

    /*
     *
     * Initialize audio component
     *
     *
     */

    var song = new Audio();

    song.src = objectUrl;
    song.autoplay = true;
    song.controls = true;

    document.getElementById('player').appendChild(song);

    song.addEventListener('canplay', function (e) {

        var source = context.createMediaElementSource(song),
            analyser = context.createAnalyser();

        source.connect(analyser);
        analyser.connect(context.destination);

        var renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        var scene = new THREE.Scene(),
            camera = new THREE.PerspectiveCamera(400, window.innerWidth / window.innerHeight, 100, 3000);

        var keyboard = new THREEx.KeyboardState();

        var paused = false;

        /* 
         * Set camera position
         *
         */

        camera.position.z = 900;
        camera.position.x = 50;
        camera.position.y = 50;

        /*
         * Set resize handler to mantain aspect ratio
         *
         */

        renderer.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);


        /*
         *
         * Animation matrix, every cell in this matrix represents one cube in big cube matrix
         *
         */

        var animations = [
      [
        [-2, -2, -2, -1],
        [-1, 1, -3, 3],
        [3, -2, 3, 2],
        [2, 2, 2, -1]
      ], [
        [-2, -1, -2, -2],
        [3, -1, 3, 2],
        [2, -3, 3, 3],
        [2, 2, 2, 2]
      ], [
        [-2, -2, -2, -2],
        [1, -3, 1, 3],
        [3, 2, 3, 1],
        [2, 2, 2, 2]
      ], [
        [-2, -2, -2, 3],
        [1, 2, -1, 2],
        [-3, -3, -2, 3],
        [2, 2, 2, 2]
      ]
    ];

        /*
         *
         * Transformations matrix codes
         *
         */

        var HORIZONTAL_HIGH = 1,
            HORIZONTAL_LOW = -1,
            VERTICAL_HIGH = 2,
            VERTICAL_LOW = -2,
            PROFONDITY_HIGH = 3,
            PROFONDITY_LOW = -3;

        /*
         *
         * Set ambient lights
         *
         */

        var ambientLight = new THREE.AmbientLight(0xFFFFFF),
            directionalLight = new THREE.DirectionalLight(0xffffff);

        directionalLight.position.set(1, 0, 1).normalize();

        scene.add(ambientLight);
        scene.add(directionalLight);

        renderer.shadowMapEnabled = true;

        document.body.appendChild(renderer.domElement);

        var dragging = false,
            previous = {
                x: 0,
                y: 0
            };

        renderer.domElement.addEventListener('mousedown', function (e) {
            dragging = true;
        });

        document.addEventListener('mouseup', function (e) {
            dragging = false;
        })

        renderer.domElement.addEventListener('mousemove', function (e) {
            var delta = {
                x: e.offsetX - previous.x,
                y: e.offsetY - previous.y
            };

            if (dragging) {
                var deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                    utils.toRadians(delta.y / 2),
                    utils.toRadians(delta.x / 2),
                    0,
                    'XYZ'
                ));

                group.quaternion.multiplyQuaternions(deltaRotationQuaternion, group.quaternion);
            }

            previous = {
                x: e.offsetX,
                y: e.offsetY
            };
        });

        var frequencyData = new Uint8Array(analyser.frequencyBinCount);

        var values = [],
            cubes = [];

        var original = [],
            color = false;

        var colors = [0x1abc9c, 0x16a085, 0x2ecc71, 0x27ae60, 0x3498db, 0x2980b9, 0x9b59b6,
                   0x8e44ad, 0x34495e, 0x2c3e50, 0xf1c40f, 0xf39c12, 0xe67e22, 0xd35400,
                   0xe74c3c, 0xc0392b, 0xecf0f1, 0xbdc3c7, 0x95a5a6, 0x7f8c8d];

        var group = new THREE.Object3D();

        for (i = 0; i < 4; i++) {
            if (!cubes[i]) {
                cubes[i] = [];
                original[i] = [];
            }

            for (j = 0; j < 4; j++) {
                if (!cubes[i][j]) {
                    cubes[i][j] = [];
                    original[i][j] = [];
                }

                for (t = 0; t < 4; t++) {
                    color = colors[Math.floor(Math.random() * colors.length)];

                    cubes[i][j][t] = new THREE.Mesh(
                        new THREE.BoxGeometry(35, 35, 35),
                        new THREE.MeshLambertMaterial({
                            color: color
                        })
                    );

                    cubes[i][j][t].overdraw = true;

                    cubes[i][j][t].position.x = i * 50;
                    cubes[i][j][t].position.y = j * 50;
                    cubes[i][j][t].position.z = t * 50;

                    original[i][j][t] = {
                        x: i * 50,
                        y: j * 50,
                        z: t * 50,
                    };

                    group.add(cubes[i][j][t]);
                }
            }
        }

        scene.add(group);

        song.addEventListener('ended', function (e) {
            scene.remove(group);
        });


        keyboard.domElement.addEventListener('keydown', function (e) {
            if (keyboard.eventMatches(e, 'space')) {

                if (paused)
                    song.play();
                else
                    song.pause();

                paused = !paused;
            }
        });


        var render = function () {
            requestAnimationFrame(render);

            analyser.getByteFrequencyData(frequencyData);
            renderer.render(scene, camera);

            var cubeValues = utils.getCubeValues(frequencyData);

            for (i = 0; i < 4; i++) {
                for (j = 0; j < 4; j++) {
                    for (t = 0; t < 4; t++) {

                        var animation = animations[i][j][t],
                            cube = cubes[i][j][t];

                        var current = cubeValues.shift();

                        if (animation == HORIZONTAL_HIGH)
                            cube.position.x = current + original[i][j][t].x;

                        if (animation == VERTICAL_HIGH)
                            cube.position.y = current + original[i][j][t].y;

                        if (animation == PROFONDITY_HIGH)
                            cube.position.z = current + original[i][j][t].z;

                        if (animation == HORIZONTAL_LOW)
                            cube.position.x = -current + original[i][j][t].x;

                        if (animation == VERTICAL_LOW)
                            cube.position.y = -current + original[i][j][t].y;

                        if (animation == PROFONDITY_LOW)
                            cube.position.z = -current + original[i][j][t].z;
                    }
                }
            }
        };

        render();
    });
};