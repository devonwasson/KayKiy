var
w = document.getElementById("vis").offsetWidth,  //set graph width
h = 550,  //set graph height
startYear = 0,  //graph start time value (static)
largestEndTime = 0,  //graph end time value (can be made dynamic)
startAge = -175,  //graph lowest downvote (static)
largestEndVotes = 0, //graph highest upvote (can be made dynamic)
beforeColor = 'stroke:#54adf1',
afterColor = 'stroke:#54adf1';

var startEnd = {};  //initialize
var allCurrData = {};

d3.json("../static/json/allData.json", function(data) {  //load the json file
  var yaks = data.yaks;  //each entry in the dict
  for (var i in yaks) {  //for each entry
    var yakInfo = yaks[i];  //yak info is the entry
    var currData = [];   //initialize current data array to hold x,y values
    var post = yakInfo.post;  //get the post message
    var votes = yakInfo.votes;  //get the list of votes
    var times = yakInfo.times;  //get the list of times
    var timestamp = yakInfo.firstTime;  //get the timestamp
    var day = yakInfo.day;      //get the day it was posted

    for (j = 0; j < times.length; j++) {
      // currData is an array of OBJECTS. Each object has an x and y attribute
      // the x attribute is the amnt of seconds. The y attribute is the votes.
      currData.push({
        x: times[j],
        y: votes[j]
      });
    }
    var key = post + timestamp;  //make the key which is unique post+time
    var lastTime = times[times.length - 1];    //make var for the last time
    var endVote = votes[times.length - 1];    //and var for the final votes
                                          //this is for dyanamic graph modeling
    startEnd[key] = {   //info in the dict for the data
      'post': post,
      'day' : day,
      'startTime': times[0],
      'startVote': votes[0],
      'endTime' : lastTime,
      'endVote': endVote
    };

//uncomment if we want all points to be shown naturally
//without a cutoff point


    if (parseInt(lastTime) > largestEndTime ) {
      largestEndTime = parseInt(lastTime) +100;
    }

//dynamic largest vote for axis
    if (parseInt(endVote) > largestEndVotes) {
      largestEndVotes = parseInt(endVote) + 20;
    }


    //add the current data to the larger allCurrData dict
    allCurrData[key] = currData;
  }


//make the graph here
  var vis = d3.select("#vis").append("svg:svg")
  .attr("width", w)
  .attr("height", h)
  .attr("class", "graph-svg-component")
  .append("svg:g");

//scale the graph
  y = d3.scale.linear().domain([largestEndVotes, startAge]).range([0, h]),
  x = d3.scale.linear().domain([0, largestEndTime]).range([0, w]),
  years = d3.range(startYear, largestEndTime);



  var line = d3.svg.line().x(function(d, i) {
  return x(d.x);
  }).y(function(d) {
  return y(d.y);
}).interpolate("bundle");  //smooths out the lines with interpolate


  for (var key in allCurrData) {
    var currData = allCurrData[key];

    // THIS IS WHERE WE DRAW THE LINES IN THE LINE GRAPH
    vis.append("svg:path").data([currData]) // For each data we want to plot
      .attr("key", key)
      .attr('style',  beforeColor)  //set color
      .attr("d", line) // Plot it's line based on the x and y values (see line function above)
      .on("mouseover", onmouseover) // assign interactions
      .on("mouseout", onmouseout)
      .attr("class", "line");
  }


//i have no clue what happens below here
//i have a clue now, but its better formatted and commented in main.js

  vis.append("svg:line")
  .attr("x1", x(0))
  .attr("y1", y(startAge))
  .attr("x2", x(largestEndTime))
  .attr("y2", y(startAge))
  .attr("class", "axis")

  vis.append("svg:line")
  .attr("x1", x(startYear))
  .attr("y1", y(startAge))
  .attr("x2", x(startYear))
  .attr("y2", y(largestEndVotes))
  .attr("class", "axis")

  vis.selectAll(".xLabel")
  .data(x.ticks(5))
  .enter().append("svg:text")
  .attr("class", "xLabel")
  .text(String)
  .attr("x", function(d) {return x(d)})
  .attr("y", h - 10)
  .attr("text-anchor", "middle")


  vis.selectAll(".yLabel")
  .data(y.ticks(4))
  .enter().append("svg:text")
  .attr("class", "yLabel")
  .text(String)
  .attr("x", 0)
  .attr("y", function(d) {return y(d)})
  .attr("text-anchor", "right")
  .attr("dy", 3)

  vis.selectAll(".xTicks")
  .data(x.ticks(5))
  .enter().append("svg:line")
  .attr("class", "xTicks")
  .attr("x1", function(d) {return x(d);})
  .attr("y1", y(startAge))
  .attr("x2", function(d) {return x(d);})
  .attr("y2", y(startAge) + 7)

  vis.selectAll(".yTicks")
  .data(y.ticks(4))
  .enter().append("svg:line")
  .attr("class", "yTicks")
  .attr("y1", function(d) {return y(d);})
  .attr("x1", x(-.5))
  .attr("y2", function(d) {return y(d);})
  .attr("x2", x(0))});



function onclick(d, i) {
var currClass = d3.select(this).attr("class");
if (d3.select(this).classed('selected')) {
  d3.select(this).attr("class", currClass.substring(0, currClass.length - 9));
} else {
  d3.select(this).classed('selected', true);
}
}

function onmouseover(d, i) {
  var currClass = d3.select(this).attr("class");
  d3.select(this).attr("class", currClass + " current").attr('style',  'stroke:#000');
  var key = $(this).attr("key");
  var postData = startEnd[key];

  if(parseInt(postData.endVote) == -175){
    document.getElementById("h2").innerHTML = postData.post;
    document.getElementById("p").innerHTML = "Post started with " + 0 + " votes and ended with " + -5 + " votes.";
  }
  else{
    document.getElementById("h2").innerHTML = postData.post;
    document.getElementById("p").innerHTML = "Post started with " + 0 + " votes and ended with " + postData.endVote + " votes.";
  }
}

function onmouseout(d, i) {
  var currClass = d3.select(this).attr("class");
  var prevClass = currClass.substring(0, currClass.length - 8);
  d3.select(this).attr("class", prevClass);
  var key = $(this).attr("key");  //obtain the key
  var postData = startEnd[key];  //use the key to get the post data
  d3.select(this).attr("class", prevClass).attr('style', beforeColor);
  $("#default-blurb").show();
  $("#blurb-content").html('');
}
