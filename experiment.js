// Define a template for a stroop trial
var trialTemplate = new lab.flow.Sequence({
  datacommit: false,
  content: [
    // Trial screen ------------------------------------------------------------
    // This is the central screen in the experiment:
    // the display that participants respond to.
    new lab.html.Form({
      // This screen is assigned a title,
      // so that we can recognize it more easily
      // in the dataset.
      title: 'ForecastTask',
      // Again, we use the trial page template
      contentUrl: 'pages/3-forecast_task.html',
      parameters: {
        // Color and displayed word
        // are determined by the trial
        weight: 'bold',
      },
      // Each possible color response is
      // associated with a key
      responses: {
        //'click button#submit-button': 'continue'
      },
      // The display terminates after 1500ms
      timeout: 120000,
      // Because the color is set dynamically,
      // we need to set the correct response by hand
      messageHandlers: {
        'before:prepare': function () {
          // Set the correct response
          // before the component is prepared
          //this.options.correctResponse = this.aggregateParameters.color
        },
        'run': function () {
          // Load data in suitable object
          localData = this.aggregateParameters.trial_data;
          var chartingData = []
          for (var j = 0; j < localData.length; j++) {
            chartingData.push(
              [j+1, localData[j]]
            )
          }
          
          // Generate the chart for the task
          makeChart(this.aggregateParameters.color,
            chartingData);

          
        },
        'end': function () {}
      }
    }),
  ]
})

// Create color palette for plots
var colorPalette = [
  // Red
  ["Crimson", "FireBrick", "Red"],
  // Blue
  ["SteelBlue", "RoyalBlue", "Navy"],
  // Yellow
  ["Gold", "Orange", "Goldenrod"],
  // Green
  ["ForestGreen", "OliveDrab", "LimeGreen"],
  // Pink
  ["HotPink", "DeepPink", "Magenta"],
  // Neutral
  ["DimGrey", "SlateGrey"],
  // Black
  ["Black"]
]

// Load experiment data from CSV
ExperimentDatafromCSV = []

var csvParseOptions = {
  download: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function (results, file) {
    //console.log("Parsing complete:", results, file);
    ExperimentDatafromCSV = results;
    console.log("Experiment CSV File loaded.")

    var getTrialData = function (index) {
      var trialDataObject = {
        id: ExperimentDatafromCSV.data[0][index],
        rule: ExperimentDatafromCSV.data[1][index],
        init: ExperimentDatafromCSV.data[2][index],
        data: ExperimentDatafromCSV.data.slice(3).map(i => i[index])
      }
      return (trialDataObject)
    }

    // Create trials 
    var Ntrials = ExperimentDatafromCSV.data[0].length;
    console.log("Trials loaded: " + Ntrials)

    /*
    trials = [{
        value: 1,
        color: 'FireBrick'
      },
      {
        value: 3,
        color: 'Teal'
      },
      {
        value: 2,
        color: 'Orange'
      },
    ]
    */
    
    var trials = [];
    var colorPalette_flat = [].concat.apply([], colorPalette);
    var jc = 0;
    for (var i = 0; i < Ntrials; i++) {
      var tmpTrialData = getTrialData(i);
      // Push to trial object
      trials.push({
        value: i+1,
        color: colorPalette_flat[jc],
        color_id: jc,
        trial_id: tmpTrialData.id,
        trial_rule: tmpTrialData.rule,
        trial_init: tmpTrialData.init,
        //trial_time: Array(tmpTrialData.data.length).fill(0).map((x, y) => y+1),
        trial_data: tmpTrialData.data
      })
      // Update indexes
      if (jc === colorPalette_flat.length-1) {
        jc = 0;
      } else {
        jc++;
      }
    }

    // Define the sequence of components
    // that define the experiment
    var experiment = new lab.flow.Sequence({
      content: [
        new lab.html.Screen({
          contentUrl: 'pages/1-welcome.html',
          responses: {
            'keypress(Space)': 'continue'
          },
        }),
        // Practice trials 
        new lab.flow.Loop({
          template: trialTemplate,
          templateParameters: trials,
          shuffle: true,
          parameters: {
            feedback: true,
          },
        }),
        // Thank-you page
        new lab.html.Screen({
          contentUrl: 'pages/5-thanks.html',
          // Respond to clicks on the download button
          events: {
            'click button#download': function () {
              this.options.datastore.download()
            },
          },
        }),
      ],
    })

    // Collect data in a central data store
    experiment.options.datastore = new lab.data.Store()

    // Start the experiment
    // (uncomment to run)
    experiment.run()
  }
}

var csvFile = window.location.href + "data.test_sessions.csv";
var localCsv = Papa.parse(csvFile, csvParseOptions);