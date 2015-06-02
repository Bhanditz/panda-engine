/**
    @module renderer.sprite
**/
game.module(
    'engine.renderer.sprite'
)
.require(
    'engine.renderer.container'
)
.body(function() {

/**
    @class Sprite
    @extends Container
    @constructor
    @param {Texture|String} texture
**/
game.createClass('Sprite', 'Container', {
    /**
        @property {Texture} texture
    **/
    texture: null,

    staticInit: function(texture) {
        this.super();
        this.setTexture(this.texture || texture);
    },

    /**
        @method setTexture
        @param {Texture|String} texture
    **/
    setTexture: function(texture) {
        if (!texture) return;
        this.texture = texture instanceof game.Texture ? texture : game.Texture.fromAsset(texture);
        return this;
    },

    _getBounds: function() {
        if (this._worldTransform.tx === null) this._updateParentTransform();

        var width = this.texture.width / game.scale;
        var height = this.texture.height / game.scale;
        var wt = this._worldTransform;
        var a = wt.a;
        var b = wt.b;
        var c = wt.c;
        var d = wt.d;
        var tx = wt.tx;
        var ty = wt.ty;
        var minX = tx;
        var maxX = tx;
        var minY = ty;
        var maxY = ty;
        
        var x2 = a * width + tx;
        var y2 = b * width + ty;
        var x3 = a * width + c * height + tx;
        var y3 = d * height + b * width + ty;
        var x4 = c * height + tx;
        var y4 = d * height + ty;

        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;

        for (var i = 0; i < this.children.length; i++) {
            var childBounds = this.children[i]._getBounds();
            var childMinX = childBounds.x;
            var childMaxX = childBounds.x + childBounds.width;
            var childMinY = childBounds.y;
            var childMaxY = childBounds.y + childBounds.height;

            minX = (minX < childMinX) ? minX : childMinX;
            minY = (minY < childMinY) ? minY : childMinY;
            maxX = (maxX > childMaxX) ? maxX : childMaxX;
            maxY = (maxY > childMaxY) ? maxY : childMaxY;
        }

        this._worldBounds.x = minX;
        this._worldBounds.y = minY;
        this._worldBounds.width = maxX - minX;
        this._worldBounds.height = maxY - minY;
        return this._worldBounds;
    },

    _render: function(context) {
        if (!this.texture) return;
        if (!this.texture.width && this.texture.baseTexture.width) {
            this.texture.width = this.texture.baseTexture.width;
        }
        if (!this.texture.height && this.texture.baseTexture.height) {
            this.texture.height = this.texture.baseTexture.height;
        }
        if (!this.texture.width || !this.texture.height) {
            return this._renderChildren(context);
        }

        this.super(context);
    },

    _renderWebGL: function() {
        game.renderer._spriteBatch.render(this);
    },

    /**
        @method _renderCanvas
        @param {CanvasRenderingContext2D} context
        @param {Matrix} [transform]
        @param {Rectangle} [rect]
        @param {Rectangle} [offset]
        @private
    **/
    _renderCanvas: function(context, transform, rect, offset) {
        if (!this.texture.baseTexture.loaded) return;

        context.globalAlpha = this._worldAlpha;

        var t = this.texture;
        var wt = transform || this._worldTransform;
        var tx = wt.tx;
        var ty = wt.ty;
        
        if (game.Renderer.roundPixels) {
            tx = tx | 0;
            ty = ty | 0;
        }

        tx *= game.scale;
        ty *= game.scale;

        var x = t.position.x;
        var y = t.position.y;
        var width = t.width;
        var height = t.height;

        if (rect) {
            x = rect.x;
            y = rect.y;
            width = rect.width;
            height = rect.height;
        }

        if (offset) {
            tx += offset.x;
            ty += offset.y;
        }

        context.setTransform(wt.a, wt.b, wt.c, wt.d, tx, ty);
        context.drawImage(t.baseTexture.source, x, y, width, height, 0, 0, width, height);
    }
});

game.defineProperties('Sprite', {
    width: {
        get: function() {
            return this.scale.x * this.texture.width / game.scale;
        },

        set: function(value) {
            this.scale.x = value / this.texture.width;
        }
    },

    height: {
        get: function() {
            return this.scale.y * this.texture.height / game.scale;
        },

        set: function(value) {
            this.scale.y = value / this.texture.height;
        }
    }
});

});
