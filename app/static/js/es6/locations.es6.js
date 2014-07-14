(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fetchLocations();
  }


  function fetchLocations() {
  $.ajax('/getLocations').done(function(data){
    console.log(data);
  });
}







})();
