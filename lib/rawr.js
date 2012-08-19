(function() {
  var Chart;

  Chart = (function() {

    function Chart(where, width, height, margin) {
      this.width = width;
      this.height = height;
      this.margin = margin;
      this.parent = where.append('div').classed("backgrondCanvas", true).style("font-family", "Helvetica").style("font-size", "11").style("position", "relative").style("width", this.width).style("height", this.height);
      this.axesCanvas = this.getLayerCanvas("axes");
    }

    Chart.prototype.getLayerCanvas = function(layerName) {
      var _base, _ref;
      if (this.canvases == null) this.canvases = {};
      return (_ref = (_base = this.canvases)[layerName]) != null ? _ref : _base[layerName] = this.parent.append('svg:svg').classed("" + layerName + "Layer", true).style("position", "absolute").style("left", 0).style("right", 0).style("width", this.width).style("height", this.height);
    };

    Chart.prototype.draw = function(data, styles) {
      this.calculateScale(data);
      this.drawXLabels();
      this.drawYLabels();
      this.drawDataRectangles(data[0], styles, 0);
      return this.drawDataRectangles(data[1], styles, 1);
    };

    Chart.prototype.calculateScale = function(data) {
      var maxY, totalX, _ref, _ref2;
      totalX = d3.max(data, function(layer) {
        return d3.sum(layer, function(item) {
          return item.width;
        });
      });
      maxY = d3.max(_.flatten(data), function(item) {
        return item.height;
      });
      this.oldXScale = (_ref = this.xScale) != null ? _ref : this.margin;
      this.oldYScale = (_ref2 = this.yScale) != null ? _ref2 : this.height - this.margin;
      this.xScale = d3.scale.linear().domain([0, totalX]).range([this.margin, this.width - this.margin]);
      return this.yScale = d3.scale.linear().domain([0, maxY]).range([this.height - this.margin, this.margin]);
    };

    Chart.prototype.drawXLabels = function() {
      this.xLabels = this.axesCanvas.selectAll(".x-label").data(this.xScale.ticks(10), String);
      this.xLabels.enter().append("text").attr("class", "x-label").attr("text-anchor", "middle").attr("x", this.oldXScale).attr("y", this.height - this.margin + 15).text(String);
      this.xLabels.transition().duration(500).attr("x", this.xScale);
      return this.xLabels.exit().transition().duration(500).attr("x", this.xScale).style("opacity", "0").remove();
    };

    Chart.prototype.drawYLabels = function() {
      this.yLabels = this.axesCanvas.selectAll(".y-label").data(this.yScale.ticks(10), String);
      this.yLabels.enter().append("text").attr("class", "y-label").attr("alignment-baseline", "middle").attr("text-anchor", "end").attr("x", this.margin - 5).attr("y", this.oldYScale).text(String);
      this.yLabels.transition().duration(500).attr("y", this.yScale);
      return this.yLabels.exit().transition().duration(500).attr("y", this.yScale).style("opacity", "0").remove();
    };

    Chart.prototype.drawDataRectangles = function(data, styles, layerName) {
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
