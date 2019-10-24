
var generateID = function(index) {
    var collection = ['Lada', 'BMW', 'KAMAZ', 'OPEL', 'Mercedes'];
    return collection[index];
  }
  
  var generateModel = function(index) {
    var collection = ['784563', '956324', '895632', '145236', '789456'];
    return collection[index];
  }

  var generateStock = function() {
    var collection = ['Apple','Avocado','Kiwi','Lime','Lemon'];

    var index = Math.floor(matchMedia.random()* 5);
    return collection[index];

}

var generateStock = function() {
    var collection = ['Apple','Avocado','Kiwi','Lime','Lemon'];

    var index = Math.floor(Math.random()* (5 - 1) + 1);
    return collection[index];
}

  
  for(i = 0; i < 5; i++) {
    db.Vehicles.insert({
      id  : generateID(i),
      model  : generateModel(i),
      Vehicles : generateStock()
    })
  }
