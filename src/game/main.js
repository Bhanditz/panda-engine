game.module(
    'game.main'
)
.body(function() {

game.addAsset('panda.png');

game.createScene('Main', {
    backgroundColor: '#666',

    init: function() {
        var sprite = new game.Sprite('panda.png');
        sprite.addTo(this.stage);
    }
});

});
