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
      var addDisplayText, maxY, totalX;
      addDisplayText = function(data) {
        var previous_t;
        previous_t = "";
        return _(data).each(function(d) {
          if (previous_t !== d.title) {
            d.display_text = d.title;
            return previous_t = d.title;
          } else {
            return d.display_text = "";
          }
        });
      };
      addDisplayText(data);
      totalX = d3.sum(data, function(d) {
        return d.width;
      });
      maxY = d3.max(data, function(d) {
        return d.height;
      });
      this.xScale = d3.scale.linear().domain([0, totalX]).range([this.margin, this.width - this.margin]);
      this.yScale = d3.scale.linear().domain([0, maxY]).range([this.height - this.margin, this.margin]);
      this.drawXLabels();
      this.drawYLabels();
      this.drawDataRectangles(data, styles);
      return this.drawRectangleLabels(data);
    };

    Chart.prototype.drawXLabels = function() {
      return this.chart.selectAll(".x-label").data(this.xScale.ticks(10)).enter().append("text").attr("class", "x-label").attr("x", this.xScale).attr("y", this.height - this.margin + 15).attr("text-anchor", "middle").text(String);
    };

    Chart.prototype.drawYLabels = function() {
      return this.chart.selectAll(".y-label").data(this.yScale.ticks(10)).enter().append("text").attr("class", "y-label").attr("x", this.margin - 5).attr("y", this.yScale).attr("text-anchor", "end").attr("alignment-baseline", "middle").text(String);
    };

    Chart.prototype.drawDataRectangles = function(data, styles, className) {
      var addStartingX, xScale, yScale;
      if (className == null) className = 'layer1';
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
      return this.chart.selectAll('.' + className).data(data).enter().append("rect").attr("class", className).attr("x", function(d) {
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
      return this.chart.selectAll('.box-label').data(data).enter().append("g").attr("class", "box-label").attr("transform", function(d) {
        return "translate(" + (xScale(d.start_x) + 11) + "," + labelY + ")";
      }).append("text").text(function(d) {
        return d.display_text;
      }).attr("transform", "rotate(270)");
    };

    return Chart;

  })();

  window.Chart = Chart;

}).call(this);
