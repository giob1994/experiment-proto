function makeChart(lineColor, data) {

    // Use external CSV parser
    // http://papaparse.com/ 
    // Read the data for the experiment
    /*
    var csvParseOptions = {
        dynamicTyping: true,
        skipEmptyLines: true
    }
    csv = Papa.parse(document.getElementById('data').innerHTML, csvParseOptions);
    */

    // Compute the next-period time period based on the 
    // time scaled given from the data to plot with the 
    // right xAxis limits...
    var xAxisMaxValue = data.reduce(function (a, b) {
        return Math.max(a, b[0]);
    }, initialValue = 0) + 1;

    var yAxisMaxValue = data.reduce(function (a, b) {
        return Math.max(a, b[1]);
    }, initialValue = 0) + 1;
    var yAxisMinValue = data.reduce(function (a, b) {
        return Math.min(a, b[1]);
    }, initialValue = 1000) - 1;

    //console.log("y: " + Math.round(yAxisMaxValue) + "/" + Math.round(yAxisMinValue))

    //var selectedPoint = [];

    // Construct the chart from the data
    Highcharts.chart({
        // General chart options
        chart: {
            renderTo: 'container',
            type: 'scatter',
            // Click event for adding the forecast point the
            // first time. Do not respond if outside the xAxis bounds
            events: {
                click: function (e) {
                    // find the clicked values and the series
                    var x = Number(e.xAxis[0].value.toFixed(2)),
                        y = Number(e.yAxis[0].value.toFixed(2)),
                        series = this.series[0];
                    //console.log(Math.abs(x))
                    // get last xAxis value:
                    // (1) If no point present at 't+1', then ADD
                    // (2) If forecast already choosen, then REMOVE 
                    var lastPointX = series.processedXData[series.processedXData.length - 1]
                    // check if in bounds for interaction
                    if (Math.abs(x - xAxisMaxValue) < 2.5) {
                        if (lastPointX !== xAxisMaxValue) {
                            //console.log('Correct Click on Plot!')
                            // Add it
                            series.addPoint([xAxisMaxValue, y]);
                        } else {
                            series.points[series.points.length - 1].remove();
                            series.addPoint([xAxisMaxValue, y]);
                        }
                        selectedPoint = [xAxisMaxValue, y];
                        // push the forecast to the HTML form
                        document.getElementById('selection-box').value = y;
                    } else {
                        //console.log([x, y])
                    }
                },
            }
        },
        title: {
            text: 'Test'
        },
        xAxis: {
            softMax: xAxisMaxValue + 4,
            tickInterval: 5,
            gridLineWidth: 1,
            title: {
                text: 'Time',
                style: {
                    fontSize:'18px'
                }
            },
            plotLines: [{
                color: 'grey', // Color value
                dashStyle: 'ShortDot', // Style of the plot line. Default to solid
                value: xAxisMaxValue, // Value of where the line will appear
                width: 1.5 // Width of the line    
            }],
            labels: {
                style: {
                    fontSize:'15px'
                }
            }
        },
        yAxis: {
            //tickInterval: 30,
            tickAmount: 3,
            title: {
                text: 'Price',
                style: {
                    fontSize:'18px'
                }
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            max: Math.round(yAxisMaxValue),
            min: Math.round(yAxisMinValue),
            minRange: 1,
            labels: {
                style: {
                    fontSize:'15px'
                }
            }
        },
        data: {
            firstRowAsNames: false,
            rows: data
        },
        tooltip: {
            shape: 'square',
            animation: false,
            valueDecimals: 2,
            crosshairs: [true, true],
            snap: 20,
            hideDelay: 300
        },
        annotations: [{
            labelOptions: {
                backgroundColor: 'rgba(255,255,255,0.5)',
                verticalAlign: 'top',
                y: 15
            },
            labels: [{
                point: {
                    xAxis: 0,
                    yAxis: 0,
                    x: xAxisMaxValue,
                    y: 80
                },
                text: 'HEllo'
            }]
        }],
        plotOptions: {
            series: {
                marker: {
                    radius: 5
                },
                cursor: 'crosshair',
                animation: {
                    duration: 1500
                },
                stickyTracking: false,
                lineWidth: 2 ,
                color: lineColor,
                point: {
                    /*events: {
                        click: function () {
                            if (this.series.data.length > 1) {
                                this.remove();
                            }
                        }
                    }*/
                },
                dragDrop: {
                    draggableX: false,
                    draggableY: true,
                    liveRedraw: true,
                    dragSensitivity: 1,
                    dragPrecisionY: 0.02
                },
                point: {
                    events: {
                        drag: function (e) {
                            // Returning false stops the drag and drops. Example:
                            //console.log(e.target.x)
                            // check if in bounds for interaction
                            if (e.target.x !== xAxisMaxValue) {
                                return false;
                            }
                        },
                        drop: function (e) {
                            // check if in bounds for interaction
                            if (e.target.x !== xAxisMaxValue) {
                                return false;
                            } else {
                                var y = e.newPoint.y.toFixed(2);
                                selectedPoint = [xAxisMaxValue, y];
                                // push the forecast to the HTML form
                                document.getElementById('selection-box').value = y;
                            }
                        }
                    }
                }
            },
        },
    });

};
