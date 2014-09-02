/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    showStreetView();

    $('body').click(function(event){
      var target = event.target;
      var sectionNum = $(target).attr('data') * 1;
      findSection(sectionNum);
    });

  }


//===== pulls up for the street view when show more is click in an info window: Richmond
  function showStreetView (){
    var lat = $('#coords').attr('data-lat'); //grabs the coordinate data which is stored in the show more link of each infowindow
    var long = $('#coords').attr('data-long');
    var streetLatLng = new google.maps.LatLng(lat, long);

    var panoOptions = {
      position: streetLatLng,
      addressControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_CENTER
      },
      linksControl: false,
      panControl: false,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      },
      enableCloseButton: false
    };

    var streetView = new google.maps.StreetViewPanorama(
      document.getElementById('street-view'), panoOptions);
      wikiAPICall();
  }



  function wikiAPICall() {
    $.getJSON(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=Tennessee&prop=text|images|sections&callback=?`).done(function(data){
      wikipediaHTMLResult(data);
    });
  }


  function wikipediaHTMLResult (data) {
    var readData = $('<div>' + data.parse.text['*'] + '</div>');
    var sections = data.parse.sections;

    sections.forEach((s, i)=>{
        var $a = $('<a href="#'+s.anchor+'", data='+s.index+'>'+s.line+'</a>');
        $('#wiki-nav').append($a);
    });

    var info = readData.find('p').toArray();

      var $div = $('<div></div>');
      $div.text(info[0].textContent);
      $('#wiki').append($div);

    // var imageURL = readData.find('img').toArray();
    // imageURL.forEach(i=>{
    //   $('#wiki').append('<div><img src="'+ i.src + '"/></div>');
    // });
  }

  function findSection(section){

    $.getJSON(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=Tennessee&prop=text&section=${section}&callback=?`).done(function(data){
      var text = data.parse.text['*'];
      var readData = $('<div>' + text + '</div>');
      $('#wiki-description').empty();
      $('#wiki-description').append(readData);
      $('html, body').animate({
        scrollTop: $('#wiki-description').offset().top
      }, 500);

    });
  }

})();
