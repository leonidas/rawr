(function() {
  var Chart;

  Chart = (function() {

    function Chart(where, width, height, margin) {
      this.width = width;
      this.height = height;
      this.margin = margin;
      this.chart = where.append('svg:svg').attr('width', this.width).attr('height', this.height).style("font-family", "Helvetica").style("font-size", "11");
    }

    Chart.prototype.draw = function(data, styles) {
      this.calculateScale(data);
      this.drawXLabels();
      this.drawYLabels();
      return this.drawDataRectangles(data, styles);
    };

    Chart.prototype.calculateScale = function(data) {
      var maxY, totalX;
      totalX = d3.sum(data, function(d) {
        return d.width;
      });
      maxY = d3.max(data, function(d) {
        return d.height;
      });
      this.xScale = d3.scale.linear().domain([0, totalX]).range([this.margin, this.width - this.margin]);
      return this.yScale = d3.scale.linear().domain([0, maxY]).range([this.height - this.margin, this.margin]);
    };

    Chart.prototype.drawXLabels = function() {
      this.xLabels = this.chart.selectAll(".x-label").data(this.xScale.ticks(10));
      this.xLabels.enter().append("text").attr("class", "x-label").attr("text-anchor", "middle");
      this.xLabels.attr("x", this.xScale).attr("y", this.height - this.margin + 15).text(String);
      return this.xLabels.exit().remove();
    };

    Chart.prototype.drawYLabels = function() {
      this.yLabels = this.chart.selectAll(".y-label").data(this.yScale.ticks(10));
      this.yLabels.enter().append("text").attr("class", "y-label").attr("alignment-baseline", "middle").attr("text-anchor", "end");
      this.yLabels.attr("x", this.margin - 5).attr("y", this.yScale).text(String);
      return this.yLabels.exit().remove();
    };

    Chart.prototype.drawDataRectangles = function(data, styles, className) {
      var addIndexWithinGroup, addStartingX, labelY, newRectG, xScale, yScale;
      if (className == null) className = 'layer1';
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
          d.__start_x__ = accumulator;
          return accumulator += d.width;
        });
      };
      addStartingX(data);
      xScale = this.xScale;
      yScale = this.yScale;
      labelY = this.height - this.margin - 3;
      console.log(data);
      this.rectG = this.chart.selectAll('.' + className).data(data, function(d) {
        return "" + d.title + "-" + d.__indexWithinGroup__;
      });
      this.rectG.select("rect").attr("style", function(d) {
        return styles[d.title];
      }).transition().duration(500).attr("x", function(d) {
        return xScale(d.__start_x__);
      }).attr("width", function(d) {
        return xScale(d.__start_x__ + d.width) - xScale(d.__start_x__);
      }).attr("y", function(d) {
        return yScale(d.height);
      }).attr("height", (function(d) {
        if (d.height > 0) {
          return yScale(0) - yScale(d.height);
        } else {
          return 3;
        }
      }));
      newRectG = this.rectG.enter().append("g").attr("class", className);
      newRectG.append("rect").attr("x", function(d) {
        return xScale(d.__start_x__);
      }).attr("width", function(d) {
        return xScale(d.__start_x__ + d.width) - xScale(d.__start_x__);
      }).attr("y", function(d) {
        return yScale(0);
      });
      newRectG.append("g").attr("class", "box-label").append("text").attr("transform", "rotate(270)");
      this.rectG.select("rect").attr("style", function(d) {
        return styles[d.title];
      }).transition().delay(500).duration(500).attr("x", function(d) {
        return xScale(d.__start_x__);
      }).attr("width", function(d) {
        return xScale(d.__start_x__ + d.width) - xScale(d.__start_x__);
      }).attr("y", function(d) {
        return yScale(d.height);
      }).attr("height", (function(d) {
        if (d.height > 0) {
          return yScale(0) - yScale(d.height);
        } else {
          return 3;
        }
      }));
      this.rectG.select("g").attr("transform", function(d) {
        return "translate(" + (xScale(d.__start_x__) + 11) + "," + labelY + ")";
      }).select("text").text(function(d) {
        if (d.__indexWithinGroup__ === 0) return d.title;
      });
      return this.rectG.exit().remove();
    };

    return Chart;

  })();

  window.Chart = Chart;

}).call(this);
