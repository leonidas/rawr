(function() {
  var Chart,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Chart = (function() {

    function Chart(where, width, height, margin, styles) {
      this.width = width;
      this.height = height;
      this.margin = margin;
      this.styles = styles;
      this._updateDataLayer = __bind(this._updateDataLayer, this);
      this._addOwnParamsToData = __bind(this._addOwnParamsToData, this);
      this._drawYLabels = __bind(this._drawYLabels, this);
      this._drawXLabels = __bind(this._drawXLabels, this);
      this._calculateScale = __bind(this._calculateScale, this);
      this._getLayerCanvas = __bind(this._getLayerCanvas, this);
      this._trackAllTimeSeriesNames = __bind(this._trackAllTimeSeriesNames, this);
      this._hierarchizeData = __bind(this._hierarchizeData, this);
      this._drawPage = __bind(this._drawPage, this);
      this.setPageNumber = __bind(this.setPageNumber, this);
      this.setData = __bind(this.setData, this);
      this.parent = where.append('div').classed("backgroundCanvas", true).style("font-family", "Helvetica").style("font-size", "11").style("position", "relative").style("width", this.width).style("height", this.height);
      this.axesCanvas = this._getLayerCanvas("axes");
      this.allTimeSeriesNames = [];
      this.pageCount = 0;
    }

    Chart.prototype.setData = function(data) {
      this.data = this._hierarchizeData(data);
      this.pageNames = _.keys(this.data);
      this.pageCount = this.pageNames.length;
      this.currentPageNumber = 0;
      this.allTimeSeriesNames = this._trackAllTimeSeriesNames(this.allTimeSeriesNames, this.data);
      this._calculateScale(this.data);
      this._drawXLabels();
      this._drawYLabels();
      return this._drawPage(this.pageNames[this.currentPageNumber]);
    };

    Chart.prototype.setPageNumber = function(pageNumber) {
      this.currentPageNumber = _.max([0, _.min([pageNumber, this.pageNames.length])]);
      return this._drawPage(this.pageNames[this.currentPageNumber]);
    };

    Chart.prototype._drawPage = function(pageName) {
      var _this = this;
      return _.each(this.allTimeSeriesNames, function(seriesName) {
        var _ref;
        return _this._updateDataLayer(seriesName, (_ref = _this.data[pageName][seriesName]) != null ? _ref : []);
      });
    };

    Chart.prototype._hierarchizeData = function(data) {
      var hierarchicalData,
        _this = this;
      hierarchicalData = _.groupBy(data, "page");
      _.each(_.keys(hierarchicalData), function(page) {
        return hierarchicalData[page] = _.groupBy(hierarchicalData[page], "series");
      });
      return hierarchicalData;
    };

    Chart.prototype._trackAllTimeSeriesNames = function(allTimeSeriesNames, data) {
      var currentSeriesNames;
      currentSeriesNames = _.uniq(_.flatten(_.map(data, function(pageData) {
        return _.keys(pageData);
      })));
      return _.uniq(allTimeSeriesNames.concat(currentSeriesNames));
    };

    Chart.prototype._getLayerCanvas = function(layerName) {
      var _base, _ref;
      if (this.canvases == null) this.canvases = {};
      return (_ref = (_base = this.canvases)[layerName]) != null ? _ref : _base[layerName] = this.parent.append('div').classed("" + layerName + "Layer", true).style("position", "absolute").style("left", 0).style("right", 0).style("width", this.width).style("height", this.height);
    };

    Chart.prototype._calculateScale = function(data) {
      var maxX, maxY, newXScale, newYScale, _ref, _ref2,
        _this = this;
      maxX = d3.max(_.values(data), function(pageData) {
        return d3.max(_.values(pageData), function(layerData) {
          return d3.sum(layerData, function(dataItem) {
            return dataItem.width;
          });
        });
      });
      maxY = d3.max(_.values(data), function(pageData) {
        return d3.max(_.values(pageData), function(layerData) {
          return d3.max(layerData, function(dataItem) {
            return dataItem.height;
          });
        });
      });
      newXScale = d3.scale.linear().domain([0, maxX]).range([this.margin, this.width - this.margin]);
      newYScale = d3.scale.linear().domain([0, maxY]).range([this.height - this.margin, this.margin]);
      this.oldXScale = (_ref = this.xScale) != null ? _ref : newXScale;
      this.oldYScale = (_ref2 = this.yScale) != null ? _ref2 : newYScale;
      this.xScale = newXScale;
      return this.yScale = newYScale;
    };

    Chart.prototype._drawXLabels = function() {
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

    Chart.prototype._drawYLabels = function() {
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

    Chart.prototype._addOwnParamsToData = function(data) {
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
      return _(data).each(function(d) {
        d.__startX__ = accumulator;
        return accumulator += d.width;
      });
    };

    Chart.prototype._updateDataLayer = function(layerName, data) {
      var chartCanvas, epsilon, labelY, rect, xScale, yScale,
        _this = this;
      this._addOwnParamsToData(data);
      chartCanvas = this._getLayerCanvas(layerName);
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
        return _this.styles[d.title];
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
