(function() {
  var Chart;

  Chart = (function() {

    function Chart(where, width, height, margin) {
      this.width = width;
      this.height = height;
      this.margin = margin;
      this.parent = where.append('div').classed("backgroundCanvas", true).style("font-family", "Helvetica").style("font-size", "11").style("position", "relative").style("width", this.width).style("height", this.height);
      this.axesCanvas = this.getLayerCanvas("axes");
    }

    Chart.prototype.getLayerCanvas = function(layerName) {
      var _base, _ref;
      if (this.canvases == null) this.canvases = {};
      return (_ref = (_base = this.canvases)[layerName]) != null ? _ref : _base[layerName] = this.parent.append('svg:svg').classed("" + layerName + "Layer", true).style("position", "absolute").style("left", 0).style("right", 0).style("width", this.width).style("height", this.height);
    };

    Chart.prototype.draw = function(data, styles) {
      var _this = this;
      this.calculateScale(data);
      this.drawXLabels();
      this.drawYLabels();
      return _.each(data, function(layer, index) {
        return _this.updateDataLayer(layer, styles, index);
      });
    };

    Chart.prototype.calculateScale = function(data) {
      var maxY, newXScale, newYScale, totalX, _ref, _ref2;
      totalX = d3.max(data, function(layer) {
        return d3.sum(layer, function(item) {
          return item.width;
        });
      });
      maxY = d3.max(_.flatten(data), function(item) {
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
      this.xLabels = this.parent.selectAll(".x-label").data(this.xScale.ticks(10), String);
      this.xLabels.enter().append("div").attr("class", "x-label").style("position", "absolute").style("text-align", "center").style("left", function(i) {
        return _this.oldXScale(i) - labelWidth / 2;
      }).style("width", labelWidth).style("top", this.height - this.margin + 5).text(String);
      this.xLabels.transition().duration(500).style("left", function(i) {
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
      this.yLabels = this.parent.selectAll(".y-label").data(this.yScale.ticks(10), String);
      this.yLabels.enter().append("div").attr("class", "y-label").style("position", "absolute").style("text-align", "right").style("left", 0).style("width", this.margin - 5).style("top", function(i) {
        return _this.oldYScale(i) - labelHeight / 2;
      }).style("height", labelHeight).text(String);
      this.yLabels.transition().duration(500).style("top", function(i) {
        return _this.yScale(i) - labelHeight / 2;
      });
      return this.yLabels.exit().transition().duration(500).style("top", function(i) {
        return _this.yScale(i) - labelHeight / 2;
      }).style("opacity", "0").remove();
    };

    Chart.prototype.updateDataLayer = function(data, styles, layerName) {
      var addIndexWithinGroup, addStartingX, chartCanvas, labelY, newRectG, rectG, xScale, yScale;
      addIndexWithinGroup = function(data) {
        var groupCounts;
        groupCounts = {};
        return _(data).each(function(d) {
          var _name;
          if (groupCounts[_name = d.title] == null) groupCounts[_name] = 0;
          d.__indexWithinGroup__ = groupCounts[d.title];
          return groupCounts[d.title] += 1;
        });
      };
      addIndexWithinGroup(data);
      addStartingX = function(data) {
        var accumulator;
        accumulator = 0;
        return _(data).map(function(d) {
          d.__startX__ = accumulator;
          return accumulator += d.width;
        });
      };
      addStartingX(data);
      console.log(data);
      chartCanvas = this.getLayerCanvas(layerName);
      xScale = this.xScale;
      yScale = this.yScale;
      labelY = this.height - this.margin - 3;
      rectG = chartCanvas.selectAll('.bar').data(data, function(d) {
        return "" + d.title + "-" + d.__indexWithinGroup__;
      });
      rectG.select("rect").attr("style", function(d) {
        return styles[d.title];
      }).transition().duration(500).attr("x", function(d) {
        return xScale(d.__startX__);
      }).attr("width", function(d) {
        return xScale(d.__startX__ + d.width) - xScale(d.__startX__);
      }).attr("y", function(d) {
        return yScale(d.height);
      }).attr("height", (function(d) {
        if (d.height > 0) {
          return yScale(0) - yScale(d.height);
        } else {
          return 3;
        }
      }));
      newRectG = rectG.enter().append("g").attr("class", 'bar');
      newRectG.append("rect").attr("style", function(d) {
        return styles[d.title];
      }).attr("x", function(d) {
        return xScale(d.__startX__);
      }).attr("width", function(d) {
        return xScale(d.__startX__ + d.width) - xScale(d.__startX__);
      }).attr("y", function(d) {
        return yScale(0);
      }).transition().delay(500).duration(500).attr("x", function(d) {
        return xScale(d.__startX__);
      }).attr("width", function(d) {
        return xScale(d.__startX__ + d.width) - xScale(d.__startX__);
      }).attr("y", function(d) {
        return yScale(d.height);
      }).attr("height", (function(d) {
        if (d.height > 0) {
          return yScale(0) - yScale(d.height);
        } else {
          return 3;
        }
      }));
      newRectG.append("g").attr("class", "box-label").append("text").attr("transform", "rotate(270)");
      rectG.select("g").attr("transform", function(d) {
        return "translate(" + (xScale(d.__startX__) + 11) + "," + labelY + ")";
      }).select("text").text(function(d) {
        if (d.__indexWithinGroup__ === 0) {
          return d.title;
        } else {
          return "";
        }
      });
      return rectG.exit().remove();
    };

    return Chart;

  })();

  window.Chart = Chart;

}).call(this);
