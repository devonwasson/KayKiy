var
  WIDTH = 600, //set graph width
  HEIGHT = 300, //set graph height
  MIN_TIME = 0, //graph start time value (static)
  MAX_TIME = 24, //graph end time value (can be made dynamic)
  MIN_VOTES = -99, //graph lowest downvote (static)
  MAX_VOTES = 200, //graph highest upvote (can be made dynamic)
  Y_AXIS_TICKS = 5,
  X_AXIS_TICKS = 5;

// Set post thresholds of test response
var
  FIRST_Q_THRESH = -6,
  SECOND_Q_THRESH = 0,
  THIRD_Q_THRESH = 11,
  FOURTH_Q_THRESH = 33;

// Arbitrary string to represent a deleted post
var DELETED_POST = "-175";

// Stylistic Globals
var
  LINE_COLOR = "#30dbbd",
  CURR_LINE_COLOR = "#54adf1",
  CURR_LINE_WIDTH = 4;

// Scale the graph. Used for axes
var
  y = d3.scale.linear().domain([MAX_VOTES, MIN_VOTES]).range([0, HEIGHT]),
  x = d3.scale.linear().domain([0, MAX_TIME]).range([0, WIDTH]);

var totalRight = 0; //user data
var totalGuessed = 0;

// ---------- SET FEEDBACK MESSAGES --------------
// if the user guessed a post was removed
function removed() {
  var postVote = document.getElementById("post").finalVote; //get data from post
  var lastTime = document.getElementById("post").finalTime;
  var resultText = document.getElementById("resultText");
  totalGuessed += 1; //up their total guess

  //if they guessed right
  if (postVote == DELETED_POST) {
    totalRight += 1; //up their total amnt right and display correct text
    resultText.innerHTML =
      "<span style='color:green;'>You guessed right!</span><br>This was removed by the community." +
      "<br>We think it was deleted in about " + timeToMinutes(lastTime) +
      getCorrectText();
  }
  //if they guessed removed and it wasnt, display text based on quartiles
  else {
    // Create the Response text
    resultText.innerHTML =
      getResultMessage("wrong.", postVote) +
      getFeedback(true, getQuartile(postVote)) +
      getCorrectText();
  }
  secondVisibilities()
}

//if they guessed it stayed on
function kept() {
  var postVote = document.getElementById("post").finalVote;
  var lastTime = document.getElementById("post").finalTime;
  var resultText = document.getElementById("resultText");
  totalGuessed += 1; //add one to their total guess count
  //if post was actually deleted, display results
  if (postVote == DELETED_POST) {
    resultText.innerHTML =
      "<span style='color:red;'>You guessed wrong.</span><br>The community downvoted this to deletion." +
      "<br>We think it was removed in about " + timeToMinutes(lastTime) +
      getCorrectText();
  }
  //if they correctly guessed that the message was kept on.
  else {
    totalRight += 1;
    // Create the text
    resultText.innerHTML =
      getResultMessage("right.", postVote) +
      getFeedback(false, getQuartile(postVote)) +
      getCorrectText();
  }
  secondVisibilities()
}

// Returns the quartile that I post is in (based on upvotes)
function getQuartile(postVote) {
  if (postVote <= SECOND_Q_THRESH) { //then display results based on quartiles
    return FIRST_Q_THRESH;
  } else if (postVote > FOURTH_Q_THRESH) {
    return FOURTH_Q_THRESH;
  } else if (postVote > THIRD_Q_THRESH) {
    return THIRD_Q_THRESH;
  } else if (postVote > SECOND_Q_THRESH) {
    return SECOND_Q_THRESH;
  }
}

// Return a personalized feedback message based on the user's
// hypothesis and the reality of the Yak.
function getFeedback(isDeleted, postQuartile) {
  // NOTE: THIS IS NOT BEING USED YET.
  feedback = "";
  // If the user guessed it would be deleted
  if (isDeleted) {
    switch (postQuartile) {
      case FIRST_Q_THRESH:
        feedback =
          "You weren't too far off. We never saw it deleted, but it came close.";
        break;
      case SECOND_Q_THRESH:
        feedback =
          "However, it wasn't exactly very popular.";
        break;
      case THIRD_Q_THRESH:
        feedback =
          "This ended up being in the top half of all posts that we observed" +
          "<br>It's worth pausing for a second and considering why you thought the community would vote this off.";
        break;
      case FOURTH_Q_THRESH:
        feedback =
          "Not only was this kept on the feed, it was one of the most heavily endorsed posts that we collected!" +
          "<br>You were pretty far off on this one. It's worth thinking why your views don't match with the community.";
        break;
    }
  }
  // The user guessed that it would be kept
  else {
    switch (postQuartile) {
      case FIRST_Q_THRESH:
        feedback =
          "While it stayed on the feed, it was one of the least popular posts that we collected" +
          "<br>How certain were you that this would be deleted?";
        break;
      case SECOND_Q_THRESH:
        feedback =
          "But it wasn't exactly popular either.";
        break;
      case THIRD_Q_THRESH:
        feedback =
          "This was one of the more popular posts, and probably received a fair amount of attention.";
        break;
      case FOURTH_Q_THRESH:
        feedback =
          "Out of all the yaks we collected, this was one of the most widely upvoted.";
        break;
    }
  }
  return "<br>" + feedback;
}

function getResultMessage(correctness, postVote) {
  if (correctness == "right."){
  return "<span style='color:green;'>You guessed " + correctness +
    "</span> The final score of this post was <span style='color:green;'>" +
    postVote + "</span>";
  } else{
    return "<span style='color:red;'>You guessed " + correctness +
      "</span> The final score of this post was <span style='color:green;'>" +
      postVote + "</span>";
  }
}

function timeToMinutes(time) {
  return "<span style='color:red;'>" + (parseFloat(time) * 60).toFixed() +
    "</span> minutes.";
}

function setResultTest(newText) {
  document.getElementById("resultText").innerHTML = newText;
}

function getCorrectText() {
  return "<br>You have gotten " +
    totalRight + " out of " + totalGuessed + " correct.";
}

function secondVisibilities() {
  // gets rid of guessing buttons
  // adds in the try again button
  // makes graph and result data visible
  document.getElementById("button1").style.display = "none";
  document.getElementById("button2").style.display = "none";
  document.getElementById("button3").style.visibility = "visible";
  document.getElementById("graphAndLabel").style.visibility = "visible";
  document.getElementById("resultStats").style.visibility = "visible";
}

var startEnd; //initialize a bunch of global variables
var allKeptData;
var allDeletedData;
var keptPosts;
var deletedPosts;
var lineList;

//manipulate the  webpage (called by the user)
function getNewPost() {
  // ---------- INITIALIZE UPDATED GRAPH -----------//
  //clear result text
  document.getElementById("resultText").innerHTML = "";
  //hide the old graph, then remove it.
  document.getElementById("graphAndLabel").style.visibility = "hidden";
  d3.select("svg").remove();

  //make the new graph here
  var vis = d3.select("#graph").append("svg:svg")
    .attr("width", WIDTH - 10)
    .attr("height", HEIGHT + 10)
    .attr("class", "graph-svg-component")
    .append("svg:g");

  //make a line variable so we can draw lines on graph
  var line = d3.svg.line()
    .x(function(d, i) {
      return x(d.x);
    })
    .y(function(d) {
      return y(d.y);
    })
    .interpolate("bundle"); //smooths out the lines with interpolate

  // ---------- CHOOSE THE POST WE SHOW TO USERS -----------//
  //choose a random number to decide if we do a post kept on or off
  var randNum = Math.floor((Math.random() * 10) + 0);

  // Decide whether we are randomly selecting a post from posts
  // that were kept or posts that were deleted.
  if (randNum < 6) {
    postPool = keptPosts;
    allPostData = allKeptData;
  } else {
    postPool = deletedPosts;
    allPostData = allDeletedData;
  }
  // Choose the post to show
  var postNum = Math.floor((Math.random() * (postPool.length - 1)) + 0);
  var endVote = postPool[postNum].endVote; //get its last vote
  var endTime = postPool[postNum].endTime; //get its last time (for scale)
  var post = postPool[postNum].post; //find its actual content

  //add the post to the front of the list of lines
  lineList.unshift([allPostData[postNum], postNum, line]);

  //-------- DRAW THE LINES IN THE LINE GRAPH-----------
  var CURR_LINE_INDEX = 0
    // draw all but the first line in green
  for (var index in lineList) { //for ever line in the list
    //if its not the first, draw it.
    if (index != CURR_LINE_INDEX) {
      vis.append("svg:path").data([lineList[index][0]]) // For each data we want to plot
        .attr("key", lineList[index][1])
        .attr("d", lineList[index][2]) // Plot it's line based on the x and y values (see line function above)
        .attr("class", "line")
        .attr('style', 'stroke:' + LINE_COLOR); //, stroke-width:1.6;');
    }
  }
  // draw the current line in blue and bigger (the first is the most recent)
  vis.append("svg:path").data([lineList[CURR_LINE_INDEX][0]]) // For each data we want to plot
    .attr("key", lineList[CURR_LINE_INDEX][1])
    .attr("d", lineList[CURR_LINE_INDEX][2]) // Plot it's line based on the x and y values (see line function above)
    .attr("class", "line")
    .attr('style', 'stroke:' + CURR_LINE_COLOR + '; stroke-width:' +
      CURR_LINE_WIDTH + ';');

  // -------  DRAWING THE AXIS ON THE GRAPH   --------
  //make the x axis.
  vis.append("svg:line")
    .attr("x1", x(0))
    .attr("y1", y(MIN_VOTES) - 99) //shift it up to be at 0
    .attr("x2", x(MAX_TIME) + 20)
    .attr("y2", y(MIN_VOTES) - 99) //shift the other end up, too
    .attr("class", "axis")
    .attr("text-anch", "end")

  //make the y axis
  vis.append("svg:line")
    .attr("x1", x(MIN_TIME))
    .attr("y1", y(MIN_VOTES) + 10)
    .attr("x2", x(MIN_TIME))
    .attr("y2", y(MAX_VOTES) - 10)
    .attr("class", "axis")
    .attr("text-anch", "end")

  //make the x labels (time)
  vis.selectAll(".xLabel")
    .data(x.ticks(X_AXIS_TICKS))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) {
      return x(d)
    })
    .attr("y", HEIGHT - 5)
    .attr("text-anchor", "middle")


  //make the y labels (votes)
  vis.selectAll(".yLabel")
    .data(y.ticks(Y_AXIS_TICKS))
    .enter().append("svg:text")
    .attr("class", "yLabel")
    .text(function(String) {
      if (String < 0) {
        return -5 //replace label with -5
      } else {
        return String
      }
    })
    .attr("x", 5)
    .attr("y", function(d) {
      return y(d)
    })
    .attr("text-anchor", "right")
    .attr("dy", 3)

  //make the x ticks
  vis.selectAll(".xTicks")
    .data(x.ticks(X_AXIS_TICKS))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) {
      return x(d);
    })
    .attr("y1", y(MIN_VOTES) - 99) //shift so we can see
    .attr("x2", function(d) {
      return x(d);
    })
    .attr("y2", y(MIN_VOTES) - 92)


  //make the y ticks
  vis.selectAll(".yTicks")
    .data(y.ticks(Y_AXIS_TICKS))
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) {
      return y(d);
    })
    .attr("x1", x(-.5)) //shift so we can see
    .attr("y2", function(d) {
      return y(d);
    })
    .attr("x2", x(0))

  //-------------- SET UP SOME INTERFACE ELEMENTS -----------//
  //reset text, set elements to have data, show guessing buttons, hide try again
  //buttons, make the graph and graph name hidden
  //if post does not have quotes around it, add them
  if (post[0] != '"') {
    document.getElementById("post").innerHTML = '"' + post + '"';
  } else {
    document.getElementById("post").innerHTML = post;
  }
  document.getElementById("post").finalVote = endVote;
  document.getElementById("post").finalTime = endTime;
  document.getElementById("button3").style.visibility = "hidden";
  document.getElementById("button1").style.display = "inline";
  document.getElementById("button2").style.display = "inline";
  document.getElementById("graphAndLabel").style.visibility = "hidden";
}

// --------- START CODE. RUNS FIRST -------------------------//
function getData(schoolName){
  //a school name is passed in. Data is loaded based on the school
  if (schoolName == "bucknell"){
    schoolJson = "../static/json/bucknellData.json";
  }
  else if (schoolName == "bloom"){
    schoolJson = "../static/json/bloomData.json";
  }
  else if (schoolName == "penn"){
    schoolJson = "../static/json/pennData.json";
  }
  else if (schoolName == "lehigh"){
    schoolJson = "../static/json/lehighData.json";
  }
  else{ //if for some reason, the school wasnt there, default to bucknell
    console.log("check to make sure data is there");
    schoolJson = "../static/json/bucknellData.json";
  }

  startEnd = {}; //set data storing variables to empty
  allKeptData = [];
  allDeletedData = [];
  keptPosts = [];
  deletedPosts = [];
  lineList = [];

  document.getElementById("resultText").innerHTML = ""; //clear result text
  d3.json(schoolJson, function(allData) { //load the json file
    var yaks = allData.yaks; //each entry in the dict
    for (var i in yaks) { //for each entry
      var yakInfo = yaks[i]; //yak info is the entry
      var currData = []; //initialize current data array to hold x,y values
      var post = yakInfo.post; //get the post message
      var votes = yakInfo.votes; //get the list of votes
      var times = yakInfo.times; //get the list of times
      var timestamp = yakInfo.firstTime; //get the timestamp
      var day = yakInfo.day; //get the day it was posted

      for (j = 0; j < times.length; j++) {
        // currData is an array of OBJECTS. Each object has an x and y attribute
        // the x attribute is the amount of seconds. The y attribute is the votes.
        currData.push({
          x: times[j],
          y: votes[j]
        });
      }
      var key = post + timestamp; //make the key which is unique post+time
      var lastTime = times[times.length - 1]; //make var for the last time
      var endVote = votes[times.length - 1]; //and var for the final votes
      //this is for dyanamic graph modeling
      startEnd[key] = { //info in the dict for the data
        'post': post,
        'day': day,
        'startTime': times[0],
        'startVote': votes[0],
        'endTime': lastTime,
        'endVote': endVote
      };

      //determine if it belongs in the kept or removed section of data.
      if (startEnd[key].endVote == -175) {
        deletedPosts.push(startEnd[key]);
        allDeletedData.push(currData);
      } else {
        keptPosts.push(startEnd[key]);
        allKeptData.push(currData);
      }
    }
    //now that data has been parsed, make a new post.
    getNewPost();
  });
}

//run the initial data display with default bucknell option
getData("bucknell")
