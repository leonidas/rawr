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
      this.drawDataRectangles(data, styles);
      return this.drawRectangleLabels(data);
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
      return this.chart.selectAll(".x-label").data(this.xScale.ticks(10)).enter().append("text").attr("class", "x-label").attr("x", this.xScale).attr("y", this.height - this.margin + 15).attr("text-anchor", "middle").text(String);
    };

    Chart.prototype.drawYLabels = function() {
      return this.chart.selectAll(".y-label").data(this.yScale.ticks(10)).enter().append("text").attr("class", "y-label").attr("x", this.margin - 5).attr("y", this.yScale).attr("text-anchor", "end").attr("alignment-baseline", "middle").text(String);
    };

    Chart.prototype.drawDataRectangles = function(data, styles, className) {
      var addIndexWithinGroup, addStartingX, xScale, yScale;
      if (className == null) className = 'layer1';
      addIndexWithinGroup = function(data) {
        var groupCounts;
        groupCounts = {};
        return _(data).each(function(d) {
          var _name;
          if (groupCounts[_name = d.title] == null) groupCounts[_name] = 0;
          d.indexWithinGroup = groupCounts[d.title];
          return groupCounts[d.title] += 1;
        });
      };
      addIndexWithinGroup(data);
      addStartingX = function(data) {
        var accumulator;
        accumulator = 0;
        return _(data).map(function(d) {
          d.start_x = accumulator;
          return accumulator += d.width;
        });
      };
      addStartingX(data);
      xScale = this.xScale;
      yScale = this.yScale;
      console.log(data);
      this.rectG = this.chart.selectAll('.' + className).data(data, function(d) {
        return "" + d.title + "-" + d.indexWithinGroup;
      }).enter().append("g");
      return this.rectG.append("rect").attr("class", className).attr("x", function(d) {
        return xScale(d.start_x);
      }).attr("width", function(d) {
        return xScale(d.start_x + d.width) - xScale(d.start_x);
      }).attr("y", function(d) {
        return yScale(d.height);
      }).attr("height", (function(d) {
        if (d.height > 0) {
          return yScale(0) - yScale(d.height);
        } else {
          return 3;
        }
      })).attr("style", function(d) {
        return styles[d.title];
      });
    };

    Chart.prototype.drawRectangleLabels = function(data) {
      var labelY, xScale;
      xScale = this.xScale;
      labelY = this.height - this.margin - 3;
      return this.rectG.append("g").attr("class", "box-label").attr("transform", function(d) {
        return "translate(" + (xScale(d.start_x) + 11) + "," + labelY + ")";
      }).append("text").text(function(d) {
        if (d.indexWithinGroup === 0) return d.title;
      }).attr("transform", "rotate(270)");
    };

    return Chart;

  })();

  window.Chart = Chart;

}).call(this);
