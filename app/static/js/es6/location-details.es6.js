/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fetchLocationInfo();

    // $('body').click(function(event){
    //   var target = event.target;
    //   var sectionNum = $(target).attr('data') * 1;
    //   findSection(sectionNum);
    // });

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
  }

  function fetchLocationInfo(){
    var name = $('#coords').data('name');

    $.ajax('/fetchWikiInfo/'+ name).done(function(info){
      if(info.wikiParams){
        wikiAPICall(info.wikiParams);
      } else {
        console.log('No Info');
        //TODO handle locations without wiki URLS
        //TODO append other resources to page
      }
    });
  }


  function wikiAPICall(params) {
    $.getJSON(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=${params}&prop=text|images|sections&callback=?`).done(function(data){
      wikipediaHTMLResult(data, params);
    });
  }


  function wikipediaHTMLResult (data, params) {
    var readData = $('<div>' + data.parse.text['*'] + '</div>');
    var sections = data.parse.sections;

    sections.forEach((s, i)=>{
        var $a = $('<a href="#'+s.anchor+'", data-section='+s.index+' data-params='+ params +'>'+s.line+'</a>');
        $('#wiki-nav').append($a);
    });
 
      var info = readData.find('p').toArray(); //apends the first wikipedia paragraph to the page
      var $div = $('<div></div>');
      $div.text(info[0].textContent);
      $('#wiki').append($div);

    $('body').on('click', 'a', findSection);
  }

  function findSection(){
    var params = $(this).data('params');
    var section = $(this).data('section') * 1;
    $.getJSON(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=${params}&prop=text&section=${section}&callback=?`).done(function(data){
      console.log(data);
      var text = data.parse.text['*'];
      var readData = $('<div>' + text + '</div>');
      $('#wiki-description').empty();
      $('#wiki-description').append(readData);
      $('html, body').animate({
        scrollTop: $('#wiki-description').offset().top
      }, 500);

    });
  }

  function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
    $.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
  }

})();
