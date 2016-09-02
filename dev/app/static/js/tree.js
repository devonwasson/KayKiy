//for drawing the word tree
google.load("visualization", "1.1", {packages:["wordtree"]});
google.setOnLoadCallback(drawChart);

//set default word
var wordToUse = 'bucknell';


function drawChart() {
  d3.json("../static/json/allData.json", function(data) {  //load the json file
    var intermediateData = [];

    var yaks = data.yaks;  //each entry in the dict
    for (var i in yaks) {  //for each entry
      var yakInfo = yaks[i];  //yak info is the entry
      var post = yakInfo.post;  //get the post message
      intermediateData.push([post.toLowerCase()]); //push to array as lower case
    }
    var data = google.visualization.arrayToDataTable(intermediateData);

    //right root tree
    var options1 = {
      wordtree: {
        format: 'implicit',
        word: wordToUse,
        type: 'prefix'
      }
    };

    //left root tree
    var options2 = {
      wordtree: {
        format: 'implicit',
        word: wordToUse,
        type: 'suffix'
      }
    };

    //get trees and draw them
    var chart1 = new google.visualization.WordTree(document.getElementById('wordtree_basic1'));
    var chart2 = new google.visualization.WordTree(document.getElementById('wordtree_basic2'));
    chart1.draw(data, options1);
    chart2.draw(data, options2);
  })

}

//change the word to be drawn in the tree
function changeWord() {
  var x = document.getElementById("wordChoice").value;
  wordToUse = x;
  drawChart();
}

//code for allowing enter key to submit form for search bar
document.onkeydown=function(evt){
  var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
  if(keyCode == 13)
  {
    changeWord();
  }
}
