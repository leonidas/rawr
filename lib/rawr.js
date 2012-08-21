(function() {
  var Chart,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Chart = (function() {

    function Chart(where, width, height, margin) {
      this.width = width;
      this.height = height;
      this.margin = margin;
      this.updateDataLayer = __bind(this.updateDataLayer, this);
      this.addOwnParamsToData = __bind(this.addOwnParamsToData, this);
      this.drawYLabels = __bind(this.drawYLabels, this);
      this.drawXLabels = __bind(this.drawXLabels, this);
      this.calculateScale = __bind(this.calculateScale, this);
      this.draw = __bind(this.draw, this);
      this.getLayerCanvas = __bind(this.getLayerCanvas, this);
      this.parent = where.append('div').classed("backgroundCanvas", true).style("font-family", "Helvetica").style("font-size", "11").style("position", "relative").style("width", this.width).style("height", this.height);
      this.axesCanvas = this.getLayerCanvas("axes");
    }

    Chart.prototype.getLayerCanvas = function(layerName) {
      var _base, _ref;
      if (this.canvases == null) this.canvases = {};
      return (_ref = (_base = this.canvases)[layerName]) != null ? _ref : _base[layerName] = this.parent.append('div').classed("" + layerName + "Layer", true).style("position", "absolute").style("left", 0).style("right", 0).style("width", this.width).style("height", this.height);
    };

    Chart.prototype.draw = function(data, styles) {
      var _this = this;
      data = _.groupBy(data, "series");
      this.calculateScale(data);
      this.drawXLabels();
      this.drawYLabels();
      return _.each(data, function(seriesData, seriesName) {
        return _this.updateDataLayer(seriesName, seriesData, styles);
      });
    };

    Chart.prototype.calculateScale = function(data) {
      var maxY, newXScale, newYScale, totalX, _ref, _ref2,
        _this = this;
      totalX = d3.max(_.values(data), function(layer) {
        return d3.sum(layer, function(item) {
          return item.width;
        });
      });
      maxY = d3.max(_.flatten(_.values(data)), function(item) {
        return item.height;
      });
      newXScale = d3.scale.linear().domain([0, totalX]).range([this.margin, this.width - this.margin]);
      newYScale = d3.scale.linear().domain([0, maxY]).range([this.height - this.margin, this.margin]);
      this.oldXScale = (_ref = this.xScale) != null ? _ref : newXScale;
      this.oldYScale = (_ref2 = this.yScale) != null ? _ref2 : newYScale;
      this.xScale = newXScale;
      return this.yScale = newYScale;
    };

    Chart.prototype.drawXLabels = function() {
      var labelWidth,
        _this = this;
      labelWidth = 30;
      this.xLabels = this.axesCanvas.selectAll(".x-label").data(this.xScale.ticks(10), String);
      this.xLabels.enter().append("div").attr("class", "x-label").style("position", "absolute").style("text-align", "center").style("left", function(i) {
        return _this.oldXScale(i) - labelWidth / 2;
      }).style("width", labelWidth).style("top", this.height - this.margin + 5).style("opacity", "0").text(String);
      this.xLabels.transition().duration(500).style("opacity", "1").style("left", function(i) {
        return _this.xScale(i) - labelWidth / 2;
      });
      return this.xLabels.exit().transition().duration(500).style("left", function(i) {
        return _this.xScale(i) - labelWidth / 2;
      }).style("opacity", "0").remove();
    };

    Chart.prototype.drawYLabels = function() {
      var labelHeight,
        _this = this;
      labelHeight = 12;
      this.yLabels = this.axesCanvas.selectAll(".y-label").data(this.yScale.ticks(10), String);
      this.yLabels.enter().append("div").attr("class", "y-label").style("position", "absolute").style("text-align", "right").style("left", 0).style("width", this.margin - 5).style("top", function(i) {
        return _this.oldYScale(i) - labelHeight / 2;
      }).style("height", labelHeight).style("opacity", "0").text(String);
      this.yLabels.transition().duration(500).style("opacity", "1").style("top", function(i) {
        return _this.yScale(i) - labelHeight / 2;
      });
      return this.yLabels.exit().transition().duration(500).style("top", function(i) {
        return _this.yScale(i) - labelHeight / 2;
      }).style("opacity", "0").remove();
    };

    Chart.prototype.addOwnParamsToData = function(data) {
      var accumulator, groupCounts,
        _this = this;
      groupCounts = {};
      _(data).each(function(d) {
        var _name;
        if (groupCounts[_name = d.title] == null) groupCounts[_name] = 0;
        d.__indexWithinGroup__ = groupCounts[d.title];
        return groupCounts[d.title] += 1;
      });
      accumulator = 0;
      return _(data).map(function(d) {
        d.__startX__ = accumulator;
        return accumulator += d.width;
      });
    };

    Chart.prototype.updateDataLayer = function(layerName, data, styles) {
      var chartCanvas, epsilon, labelY, rect, xScale, yScale,
        _this = this;
      this.addOwnParamsToData(data);
      chartCanvas = this.getLayerCanvas(layerName);
      xScale = this.xScale;
      yScale = this.yScale;
      labelY = this.height - this.margin - 3;
      rect = chartCanvas.selectAll('.rect').data(data, function(d) {
        return "" + d.title + "-" + d.subtitle;
      });
      epsilon = 0.00000001;
      rect.style("position", "absolute").text(function(d) {
        if (d.__indexWithinGroup__ === 0) {
          return d.title;
        } else {
          return "";
        }
      }).transition().duration(500).style("left", function(d) {
        return Math.round(xScale(d.__startX__) + epsilon);
      }).style("right", function(d) {
        return Math.round(_this.width - xScale(d.__startX__ + d.width) - epsilon);
      }).style("top", function(d) {
        return Math.round(yScale(d.height));
      }).style("bottom", this.margin);
      rect.enter().append("div").attr("class", "rect").attr("style", function(d) {
        return styles[d.title];
      }).style("position", "absolute").style("left", function(d) {
        return Math.round(xScale(d.__startX__) + epsilon);
      }).style("right", function(d) {
        return Math.round(_this.width - xScale(d.__startX__ + d.width) - epsilon);
      }).style("top", this.height - this.margin).style("bottom", this.margin).style("color", "rgba(0,0,0,0)").text(function(d) {
        if (d.__indexWithinGroup__ === 0) {
          return d.title;
        } else {
          return "";
        }
      }).transition().delay(500).duration(500).style("color", "rgba(0,0,0,1)").style("top", function(d) {
        return Math.round(yScale(d.height));
      });
      return rect.exit().transition().duration(250).style("opacity", 0).remove();
    };

    return Chart;

  })();

  window.Chart = Chart;

}).call(this);
