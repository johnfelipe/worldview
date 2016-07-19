/*
 * NASA Worldview
 *
 * This code was originally developed at NASA/Goddard Space Flight Center for
 * the Earth Science Data and Information System (ESDIS) project.
 *
 * Copyright (C) 2013 - 2014 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 */

var wv = wv || {};

wv.map = wv.map || {};
/*
 * @Class
 */
wv.map.runningdata = wv.map.runningdata || function(models) {
    var self = this;
    self.layers = [];
    self.prePixelData = [];
    self.pixel  = null;
    self.oldLayers = [];
    
    self.getDataLabel = function(scale, hex) {
        for(var i = 0, len = scale.colors.length; i < len; i++)  {
            if(scale.colors[i] === hex) {
                return {label:scale.labels[i], len: len, index:i};
            };
        };
        return undefined;
    }

    self.getLabelMarginLeft = function(labelWidth, caseWidth, location) {
        if(location + (labelWidth / 2) > caseWidth) {
            return (caseWidth - labelWidth);
        } else if (location - (labelWidth / 2) < 0) {
            return 0;
        } else {
            return (location - (labelWidth / 2));
        }
    }
    self.getPalette = function(id) {
        return $('#' + id + '_palette');
    }
    self.getPercent = function(len, index, caseWidth) {
        var segmentWidth;
        var location;
        if(len < 250) {
            segmentWidth = (caseWidth / (len));
            location = ((segmentWidth * index) + (0.5 * segmentWidth));
            return (location / caseWidth);
        } else {
            return (index / len);
        }
    }
    self.LayersToRemove = function(oldArray, newArray) {
        return _.difference(oldArray, newArray);
    }
    self.newPoint = function(coords, map) {
        self.activeLayers = [];

        map.forEachLayerAtPixel(coords, function(layer, data){

            var hex;
            var palette;
            var paletteInfo;
            if(layer.wv.def.palette){
                var palette = models.palettes.get(layer.wv.id);
                if(palette) {
                    hex = wv.util.rgbaToHex(data[0], data[1], data[2]);
                    if(palette.scale) {
                        paletteInfo = self.getDataLabel(palette.scale, hex);
                        if(paletteInfo) {
                            self.setLayerValue(palette.id, paletteInfo);
                        }
                    } else if(palette.classes) {
                        paletteInfo = self.getDataLabel(palette.classes, hex);
                        if(paletteInfo) {
                            self.setCategoryValue(palette.id +'_palette', paletteInfo);
                        }
                    }
                    self.activeLayers.push(palette.id +'_palette');
                };
              };
        });
        if(self.oldLayers.length) {
            self.updateRunners(self.LayersToRemove(self.oldLayers, self.activeLayers));
        }
        self.oldLayers = self.activeLayers;
    };
    self.remove = function(id) {
        var $palette = $('#' + id);
        var $paletteCase = $palette.parent();
        $paletteCase.removeClass('wv-running');
        $palette.removeClass('wv-running');
    }
    self.setCategoryValue = function(id, data) {
        var $categoryPaletteCase;
        var $caseWidth;
        var $labelWidth;
        var $colorSquare;
        var $paletteLabel;
        var location;
        var marginLeft;
        var squareWidth;

        marginLeft = 3;
        squareWidth = 15;

        $categoryPaletteCase = $('#' + id);
        
        $colorSquare = $categoryPaletteCase.find("[data-index='" + data.index + "']");
        $paletteLabel = $categoryPaletteCase.find('.wv-running-category-label');

        $caseWidth = $categoryPaletteCase.width();

        $paletteLabel.text(data.label);
        $labelWidth = $paletteLabel.width();
        location = ((marginLeft + squareWidth) * data.index);
        labelMargin = self.getLabelMarginLeft($labelWidth, $caseWidth, location);

        $paletteLabel.attr('style', 'left:' + Math.round(location) + 'px;'); 
        $categoryPaletteCase.addClass('wv-running');
        $categoryPaletteCase.find('.wv-active').removeClass('wv-active');
        $colorSquare.addClass('wv-active');

    }
    self.setLayerValue = function(id, data) {
        var $palette;
        var $paletteCase;
        var $paletteWidth;
        var labelWidth;
        var percent;
        var labelMargin;
        var location;
        var margin;
        
        $palette = self.getPalette(id);
        $paletteCase = $palette.parent();
        $paletteWidth = $palette.width();
        $paletteCaseWidth = $paletteCase.outerWidth();
        $paletteLabel = $paletteCase.find('.wv-running-label');
        $paletteBar = $paletteCase.find('.wv-running-bar');

        percent = self.getPercent(data.len, data.index, $paletteWidth);
        margin = (($paletteCaseWidth - $paletteWidth) / 2)
        location = ($paletteWidth * percent + margin);


        $paletteLabel.text(data.label);
        labelWidth = $paletteLabel.width();

        labelMargin = self.getLabelMarginLeft(labelWidth, $paletteWidth, location);

        $paletteLabel.attr('style', 'left:' + Math.round(labelMargin) + 'px;');
        $paletteBar.attr('style', 'left:' + Math.round(location) + 'px;');
        $paletteCase.addClass('wv-running');
    }
    self.updateRunners = function(layers) {
        if(layers.length) {
            for(var i = 0, len = layers.length; i < len; i++)  {
                self.remove(layers[i]);
            };
        };
    }
};